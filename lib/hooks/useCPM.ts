"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCharsCountUntilActiveIndex } from "@/lib/data";

export type CPMTier = "차근차근" | "안정적" | "빠름" | "매우 빠름";

/** 수치 노출 조건: 이 시간(초) 이상이고 읽은 문장 N개 이상일 때만 노출 (초반 급상승 방지) */
const MIN_ELAPSED_SEC_FOR_DISPLAY = 12;
const MIN_ELAPSED_SEC_FOR_CALC = 1;
/** 오측정 방지 상한 (글자/분) */
const CPM_CAP = 1200;
/** 스무딩: 기존 값 비중을 높여 갑자기 빨라지고 느려지는 느낌 완화 (0.9/0.1) */
const SMOOTH_WEIGHT_OLD = 0.9;
const SMOOTH_WEIGHT_NEW = 0.1;
/** 초반(문장 수 적을 때) 스무딩: 새 값 반영을 더 적게 */
const EARLY_SMOOTH_WEIGHT_NEW = 0.03;
const EARLY_SENTENCE_THRESHOLD = 10;
/** 초기 스무딩 기준값 */
const INITIAL_SMOOTH_CPM = 400;
/** 수치 노출 최소 문장 수 */
const MIN_SENTENCES_FOR_DISPLAY = 6;
/** 노출값이 한 번에 바뀌는 최대 폭 (글자/분). 갑자기 튀는 것 방지 */
const MAX_DELTA_PER_UPDATE = 25;
/** 첫 노출 시 상한: 초반에 1000대로 튀는 것 방지 */
const MAX_FIRST_DISPLAY_CPM = 500;

export type CPMStatus = "measuring" | "ready";

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
  const startTimeRef = useRef<number | null>(null);
  const smoothedRef = useRef<number>(INITIAL_SMOOTH_CPM);
  /** 직전에 노출한 CPM (한 번에 너무 크게 바뀌지 않도록 제한용) */
  const lastDisplayedRef = useRef<number>(0);

  const readCount =
    centerIndex !== null && centerIndex >= 0 ? centerIndex + 1 : 0;

  useEffect(() => {
    if (sessionKey === undefined) return;
    startTimeRef.current = null;
    smoothedRef.current = INITIAL_SMOOTH_CPM;
    lastDisplayedRef.current = 0;
    setCpm(0);
    setStatus("measuring");
  }, [sessionKey]);

  useEffect(() => {
    if (!readingStarted || startTimeRef.current !== null) return;
    startTimeRef.current = Date.now();
  }, [readingStarted]);

  const updateCPM = useCallback(() => {
    const start = startTimeRef.current;
    if (!start) return;
    const sec = (Date.now() - start) / 1000;
    if (sec < MIN_ELAPSED_SEC_FOR_CALC) {
      setCpm(0);
      return;
    }
    const totalChars = getCharsCountUntilActiveIndex(sentences, centerIndex);
    if (totalChars === 0) {
      setCpm(0);
      return;
    }
    const safeSec = Math.max(sec, 1);
    let raw = (totalChars * 60) / safeSec;
    raw = Math.min(raw, CPM_CAP);
    const prev = smoothedRef.current;
    const weightNew =
      readCount < EARLY_SENTENCE_THRESHOLD
        ? EARLY_SMOOTH_WEIGHT_NEW
        : SMOOTH_WEIGHT_NEW;
    const weightOld = 1 - weightNew;
    const smoothed = prev * weightOld + raw * weightNew;
    smoothedRef.current = smoothed;
    const rounded = Math.round(smoothed);

    const canDisplay =
      sec >= MIN_ELAPSED_SEC_FOR_DISPLAY &&
      readCount >= MIN_SENTENCES_FOR_DISPLAY;
    if (canDisplay) {
      setStatus("ready");
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
      setStatus("measuring");
      setCpm(0);
    }
  }, [sentences, centerIndex, readCount]);

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
    updateCPM,
  };
}
