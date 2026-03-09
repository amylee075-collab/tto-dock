"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCharsCountUntilActiveIndex } from "@/lib/data";

export type CPMTier = "차근차근" | "안정적" | "빠름" | "매우 빠름";

// ========== CPM 노출 Gate (짧은 지문 220~320자·5~6문장 대응) ==========
/** 노출 조건: 경과 시간이 이 값(초) 이상일 때만 CPM 노출 */
const DISPLAY_MIN_ELAPSED_SEC = 5;
/** 노출 조건: 글자 수 하한. adaptive 비율보다 작으면 이 값 사용 */
const DISPLAY_MIN_CHARS_FLOOR = 100;
/** 지문 길이 대비 최소 읽은 비율(0.35 = 35%). 이만큼 읽어야 노출 */
const ADAPTIVE_CHARS_RATIO = 0.35;
/** 노출 조건: 최소 읽은 문장 수 (안전장치) */
const MIN_SENTENCES_FOR_READY = 2;
/** raw 계산 시 최소 경과 시간(초). 그 미만이면 계산하지 않음 */
const MIN_ELAPSED_SEC_FOR_CALC = 1;

// ========== CPM 상한 ==========
/** raw·smoothed·노출 공통 상한. 850이면 850 근처에서 더 이상 오르지 않는 것처럼 보이므로 1000으로 완화 */
const CPM_CAP = 1000;

// ========== 문장 체류시간(dwell time) 보정 ==========
/** 문장당 최소 체류 시간(ms). 이보다 짧으면 연타/훑기로 간주하고 최소 시간으로 보정 */
const MIN_DWELL_MS = 800;
const MIN_DWELL_SEC = MIN_DWELL_MS / 1000;

// ========== 스무딩 ==========
/** 스무딩: 새 raw 값 반영 비율. 0.15로 상향해 속도 상승이 자연스럽게 반영되도록 함 (기존 0.1은 850 근처에서 멈춘 듯한 느낌 유발) */
const SMOOTH_WEIGHT_NEW = 0.15;
const SMOOTH_WEIGHT_OLD = 1 - SMOOTH_WEIGHT_NEW;
/** 초반(문장 수 적을 때) 스무딩: 새 값 반영을 조금 더 하여 상승 구간이 잘 보이도록 */
const EARLY_SMOOTH_WEIGHT_NEW = 0.06;
const EARLY_SENTENCE_THRESHOLD = 8;
/** ready 직후 일시적 강한 스무딩: 첫 N초간 0.9:0.1로 수치가 안정적으로 올라가게 */
const READY_EARLY_SMOOTH_SEC = 3;
const READY_EARLY_SMOOTH_WEIGHT_NEW = 0.1; // 0.9 : 0.1
/** 초기 스무딩 기준값. measuring 중에도 이 값으로 계속 스무딩 누적 */
const INITIAL_SMOOTH_CPM = 400;

// ========== 노출값 변화 제한 ==========
/** 노출값이 한 번에 바뀌는 최대 폭(CPM). 40으로 상향해 고속 구간(850+)에서도 1초마다 자연스럽게 따라가도록 함 */
const MAX_DELTA_PER_UPDATE = 40;
/** ready 전환 직후 첫 노출 상한. 900~1200 급등 방지 */
const MAX_FIRST_DISPLAY_CPM = 480;

export type CPMStatus = "measuring" | "ready";

/**
 * [검토] 읽기 중 표시 CPM은 실시간 추정값이며, 읽기 완료 시점에
 * totalChars * 60 / effectiveSec 로 최종 CPM을 재계산해 저장·표시하는 구조를
 * 도입하면 결과 화면에서 더 정확한 수치를 보여줄 수 있음.
 */

/**
 * 지문 전체 글자 수 계산 (adaptive gate용).
 */
function getTotalPassageChars(sentences: string[]): number {
  return sentences.reduce((sum, s) => sum + (s?.length ?? 0), 0);
}

/**
 * CPM 노출 가능 여부: 5초 이상 + 지문의 35% 이상 읽음 + 최소 2문장.
 * 짧은 지문(220~320자)에서도 중반 이전에 속도가 노출되도록 adaptive 적용.
 */
function canDisplayCPM(
  elapsedSec: number,
  maxReachedChars: number,
  readCount: number,
  totalPassageChars: number
): boolean {
  const minCharsRequired = Math.max(
    DISPLAY_MIN_CHARS_FLOOR,
    Math.round(totalPassageChars * ADAPTIVE_CHARS_RATIO)
  );
  return (
    elapsedSec >= DISPLAY_MIN_ELAPSED_SEC &&
    maxReachedChars >= minCharsRequired &&
    readCount >= MIN_SENTENCES_FOR_READY
  );
}

/**
 * CPM 구간별 티어 반환.
 * 초등 3~6학년, 700~1500자 지문 기준 (상한 1000 반영).
 */
export function getCPMTier(cpm: number): {
  tier: CPMTier;
  label: string;
  message: string;
} {
  if (cpm <= 300)
    return {
      tier: "차근차근",
      label: "🐢 차근차근",
      message: "꼼꼼하게 읽는 중이네요!",
    };
  if (cpm <= 500)
    return {
      tier: "안정적",
      label: "✅ 안정적",
      message: "좋아요! 내용도 잘 이해하고 있나요?",
    };
  if (cpm <= 700)
    return {
      tier: "빠름",
      label: "⚡ 빠름",
      message: "내용을 파악하며 읽어보세요!",
    };
  return {
    tier: "매우 빠름",
    label: "🚀 매우 빠름",
    message: "주요 내용을 놓치지 않게 조심해요!",
  };
}

export function useCPM(
  sentences: string[],
  centerIndex: number | null,
  isActive: boolean,
  readingStarted: boolean,
  sessionKey?: string
) {
  const [cpm, setCpm] = useState(0);
  const [status, setStatus] = useState<CPMStatus>("measuring");
  /** 경과 시간(초). isReady useMemo 및 갱신 주기용 */
  const [elapsedSec, setElapsedSec] = useState(0);
  /** 세션 내 최대 도달 문장 인덱스. 뒤로 가기 시 CPM이 줄지 않도록 계산 기준으로 사용 */
  const [maxReachedIndex, setMaxReachedIndex] = useState(-1);
  const startTimeRef = useRef<number | null>(null);
  const smoothedRef = useRef<number>(INITIAL_SMOOTH_CPM);
  const lastDisplayedRef = useRef<number>(0);
  /** ready로 전환된 시점(ms). 직후 3초간 강한 스무딩 적용용 */
  const readySinceRef = useRef<number | null>(null);

  // ----- Dwell time 보정용 ref -----
  /** 현재 문장에 들어온 시점(ms). 문장 전환 시 이전 문장 체류시간 계산에 사용 */
  const lastEnterTimeRef = useRef<number | null>(null);
  /** 이전 centerIndex. 문장 전환 감지 시 dwell 누적 */
  const prevCenterIndexRef = useRef<number | null>(null);
  /** 누적된 "보정된" 읽기 시간(초). 문장별 max(실제 체류, MIN_DWELL_SEC) 합 */
  const effectiveTimeRef = useRef<number>(0);

  /** 읽은 문장 수·글자 수는 "최대 도달" 기준. 뒤로 가기해도 CPM이 감소하지 않음 */
  const readCount = maxReachedIndex >= 0 ? maxReachedIndex + 1 : 0;
  const maxReachedChars =
    maxReachedIndex >= 0
      ? getCharsCountUntilActiveIndex(sentences, maxReachedIndex)
      : 0;
  const totalPassageChars = useMemo(
    () => getTotalPassageChars(sentences),
    [sentences]
  );

  /** Ready 여부: 5초 + 지문 35% + 2문장 (adaptive, 메모이제이션) */
  const isReady = useMemo(
    () =>
      canDisplayCPM(
        elapsedSec,
        maxReachedChars,
        readCount,
        totalPassageChars
      ),
    [elapsedSec, maxReachedChars, readCount, totalPassageChars]
  );

  // ----- 세션 리셋 -----
  useEffect(() => {
    if (sessionKey === undefined) return;
    startTimeRef.current = null;
    smoothedRef.current = INITIAL_SMOOTH_CPM;
    lastDisplayedRef.current = 0;
    readySinceRef.current = null;
    lastEnterTimeRef.current = null;
    prevCenterIndexRef.current = null;
    effectiveTimeRef.current = 0;
    setCpm(0);
    setElapsedSec(0);
    setMaxReachedIndex(-1);
    setStatus("measuring");
  }, [sessionKey]);

  // ----- 최대 도달 문장 인덱스 갱신 (앞으로만 갱신, 뒤로 가기 시 유지) -----
  useEffect(() => {
    if (centerIndex === null || centerIndex < 0) return;
    setMaxReachedIndex((prev) => Math.max(prev, centerIndex));
  }, [centerIndex]);

  // ----- 읽기 시작 시 시작 시각 기록 (첫 문장 진입 시점으로 dwell 시작) -----
  useEffect(() => {
    if (!readingStarted || startTimeRef.current !== null) return;
    const now = Date.now();
    startTimeRef.current = now;
    lastEnterTimeRef.current = now;
    prevCenterIndexRef.current = centerIndex !== null && centerIndex >= 0 ? centerIndex : -1;
  }, [readingStarted, centerIndex]);

  // ----- 문장 전환 시 dwell 누적 (보정 적용) -----
  useEffect(() => {
    if (!readingStarted || startTimeRef.current === null) return;
    const now = Date.now();
    const prev = prevCenterIndexRef.current;
    const curr = centerIndex ?? -1;

    if (prev !== curr && prev >= 0) {
      const enterTime = lastEnterTimeRef.current ?? startTimeRef.current!;
      const dwellSec = (now - enterTime) / 1000;
      effectiveTimeRef.current += Math.max(dwellSec, MIN_DWELL_SEC);
    }
    if (curr >= 0) {
      lastEnterTimeRef.current = now;
      prevCenterIndexRef.current = curr;
    }
  }, [readingStarted, centerIndex]);

  const updateCPM = useCallback(() => {
    const start = startTimeRef.current;
    if (!start) return;

    const now = Date.now();
    const currentElapsedSec = (now - start) / 1000;
    setElapsedSec(currentElapsedSec);

    // CPM 계산은 "최대 도달" 기준. 뒤로 가기해도 값이 줄지 않음
    const charsForCalc =
      maxReachedIndex >= 0
        ? getCharsCountUntilActiveIndex(sentences, maxReachedIndex)
        : 0;
    const readCountForCalc = maxReachedIndex >= 0 ? maxReachedIndex + 1 : 0;

    if (currentElapsedSec < MIN_ELAPSED_SEC_FOR_CALC) {
      setCpm(0);
      return;
    }
    if (charsForCalc === 0) {
      setCpm(0);
      return;
    }

    // ----- 보정된 시간으로 raw CPM 계산 (dwell 적용) -----
    const currentSegmentSec =
      lastEnterTimeRef.current != null
        ? (now - lastEnterTimeRef.current) / 1000
        : currentElapsedSec;
    const effectiveSec =
      effectiveTimeRef.current + Math.max(currentSegmentSec, MIN_DWELL_SEC);
    const safeSec = Math.max(effectiveSec, 1);
    let raw = (charsForCalc * 60) / safeSec;
    raw = Math.min(raw, CPM_CAP);

    // ----- 노출 gate: 5초 + 지문 35% + 2문장 (adaptive, 짧은 지문 대응) -----
    const totalPassageCharsForCalc = getTotalPassageChars(sentences);
    const canDisplay = canDisplayCPM(
      currentElapsedSec,
      charsForCalc,
      readCountForCalc,
      totalPassageCharsForCalc
    );

    if (canDisplay) {
      if (readySinceRef.current === null) readySinceRef.current = now;
      setStatus("ready");

      // ----- ready 직후 3초간 강한 스무딩(0.9:0.1)으로 수치 안정화 -----
      const readyElapsedSec = (now - readySinceRef.current) / 1000;
      const useEarlySmooth = readyElapsedSec < READY_EARLY_SMOOTH_SEC;
      const weightNew =
        useEarlySmooth
          ? READY_EARLY_SMOOTH_WEIGHT_NEW
          : readCountForCalc < EARLY_SENTENCE_THRESHOLD
            ? EARLY_SMOOTH_WEIGHT_NEW
            : SMOOTH_WEIGHT_NEW;

      const prev = smoothedRef.current;
      const smoothed = prev * (1 - weightNew) + raw * weightNew;
      smoothedRef.current = smoothed;
      const rounded = Math.round(smoothed);

      const last = lastDisplayedRef.current;
      let toShow: number;
      if (last === 0) {
        toShow = Math.round(
          Math.min(MAX_FIRST_DISPLAY_CPM, Math.max(0, rounded))
        );
      } else {
        const clamped = Math.max(
          last - MAX_DELTA_PER_UPDATE,
          Math.min(last + MAX_DELTA_PER_UPDATE, rounded)
        );
        toShow = Math.round(Math.max(0, Math.min(CPM_CAP, clamped)));
      }
      lastDisplayedRef.current = toShow;
      setCpm(toShow);
    } else {
      // measuring 중에도 스무딩은 계속 업데이트
      const prev = smoothedRef.current;
      const weightNew =
        readCountForCalc < EARLY_SENTENCE_THRESHOLD
          ? EARLY_SMOOTH_WEIGHT_NEW
          : SMOOTH_WEIGHT_NEW;
      const smoothed = prev * (1 - weightNew) + raw * weightNew;
      smoothedRef.current = smoothed;
      setStatus("measuring");
      setCpm(0);
    }
  }, [sentences, maxReachedIndex]);

  useEffect(() => {
    if (!isActive) return;
    updateCPM();
  }, [centerIndex, isActive, updateCPM]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(updateCPM, 1000);
    return () => clearInterval(id);
  }, [isActive, updateCPM]);

  const tierResult = getCPMTier(cpm);
  return {
    cpm,
    status,
    tier: tierResult.tier,
    tierLabel: tierResult.label,
    tierMessage: tierResult.message,
    readCount,
    isReady,
    updateCPM,
  };
}
