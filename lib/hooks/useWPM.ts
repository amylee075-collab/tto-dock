"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWordsCountUntilActiveIndex } from "@/lib/data";

export type WPMTier = "느림" | "보통" | "빠름";

/** 수치 노출 조건: 이 시간(초) 미만이면 '측정 중' 표시 (문장 3개 미만인 경우) */
const MIN_ELAPSED_SEC_FOR_DISPLAY = 10;
/** 최소 경과 시간(초). 이 미만이면 계산 자체를 하지 않음 (0으로 나누기 방지) */
const MIN_ELAPSED_SEC_FOR_CALC = 1;
/** 연타 등으로 튀는 수치 상한 (초등 권장 150~250 고려) */
const WPM_CAP = 300;
/** 이동 평균: 기존 가중치 0.7, 현재 측정값 가중치 0.3 */
const SMOOTH_WEIGHT_OLD = 0.7;
const SMOOTH_WEIGHT_NEW = 0.3;
/** 초기 스무딩 기준값 (초등 권장 150~250 중간) */
const INITIAL_SMOOTH_WPM = 200;
/** 수치 노출 최소 문장 수: 이 개수 이상 읽으면 경과 시간과 무관하게 WPM 노출 */
const MIN_SENTENCES_FOR_DISPLAY = 3;

const WPM_SLOW = 80;
const WPM_FAST = 150;

export type WPMStatus = "measuring" | "ready";

export function getWPMTier(wpm: number): WPMTier {
  if (wpm < WPM_SLOW) return "느림";
  if (wpm <= WPM_FAST) return "보통";
  return "빠름";
}

export function useWPM(
  sentences: string[],
  centerIndex: number | null,
  isActive: boolean,
  readingStarted: boolean,
  sessionKey?: string
) {
  const [wpm, setWpm] = useState(0);
  const [status, setStatus] = useState<WPMStatus>("measuring");
  const startTimeRef = useRef<number | null>(null);
  const smoothedRef = useRef<number>(INITIAL_SMOOTH_WPM);

  const readCount =
    centerIndex !== null && centerIndex >= 0 ? centerIndex + 1 : 0;

  useEffect(() => {
    if (sessionKey === undefined) return;
    startTimeRef.current = null;
    smoothedRef.current = INITIAL_SMOOTH_WPM;
    setWpm(0);
    setStatus("measuring");
  }, [sessionKey]);

  useEffect(() => {
    if (!readingStarted || startTimeRef.current !== null) return;
    startTimeRef.current = Date.now();
  }, [readingStarted]);

  const updateWPM = useCallback(() => {
    const start = startTimeRef.current;
    if (!start) return;
    const sec = (Date.now() - start) / 1000;
    if (sec < MIN_ELAPSED_SEC_FOR_CALC) {
      setWpm(0);
      return;
    }
    const totalWords = getWordsCountUntilActiveIndex(sentences, centerIndex);
    if (totalWords === 0) {
      setWpm(0);
      return;
    }
    const safeSec = Math.max(sec, 1);
    let raw = (totalWords * 60) / safeSec;
    raw = Math.min(raw, WPM_CAP);
    const prev = smoothedRef.current;
    const smoothed = prev * SMOOTH_WEIGHT_OLD + raw * SMOOTH_WEIGHT_NEW;
    smoothedRef.current = smoothed;
    const rounded = Math.round(smoothed);

    const canDisplay =
      sec >= MIN_ELAPSED_SEC_FOR_DISPLAY || readCount >= MIN_SENTENCES_FOR_DISPLAY;
    if (canDisplay) {
      setStatus("ready");
      setWpm(rounded);
    } else {
      setStatus("measuring");
      setWpm(0);
    }
  }, [sentences, centerIndex, readCount]);

  useEffect(() => {
    if (!isActive) return;
    updateWPM();
  }, [centerIndex, isActive, updateWPM]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(updateWPM, 1000);
    return () => clearInterval(id);
  }, [isActive, updateWPM]);

  const tier = getWPMTier(wpm);
  return { wpm, status, tier, readCount, updateWPM };
}
