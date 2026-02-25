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
 * 단락 읽기 페이지 진입 시 00:00부터 시작, 최대 60:00까지 카운팅.
 * 마운트될 때마다 00:00으로 리셋됨.
 */
export function useReadingTimer(): string {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
    const id = setInterval(() => {
      setSeconds((prev) => (prev >= MAX_SECONDS ? MAX_SECONDS : prev + 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return formatMmSs(seconds);
}
