"use client";

import { useEffect, useState } from "react";

const MAX_SECONDS = 60 * 60; // 60:00

function formatMmSs(seconds: number): string {
  const s = Math.min(seconds, MAX_SECONDS);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

/**
 * 읽기 시작 전에는 00:00을 유지하고, 시작 버튼을 누른 뒤부터만 카운팅한다.
 * 페이지를 다시 열거나 새로고침하면 다시 00:00부터 시작한다.
 */
export function useReadingTimer(active: boolean): string {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
    if (!active) return;
    const id = setInterval(() => {
      setSeconds((prev) => (prev >= MAX_SECONDS ? MAX_SECONDS : prev + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  return formatMmSs(seconds);
}
