"use client";

import { useCallback, useState } from "react";

/**
 * 클릭·버튼 기반 문장 내비게이션만 사용. 스크롤/IO 로직 없음.
 * - activeIndex: 현재 활성 문장 인덱스
 * - setActiveIndex: 직접 설정 (문장 클릭 시)
 * - goNext / goPrev: [다음] [이전] 버튼용, totalCount로 클램프
 */
export function useActiveSentence(totalCount: number) {
  const [activeIndex, setActiveIndexState] = useState(0);

  const setActiveIndex = useCallback((index: number) => {
    setActiveIndexState((prev) => {
      const next = Math.max(0, Math.min(index, totalCount - 1));
      return next === prev ? prev : next;
    });
  }, [totalCount]);

  const goNext = useCallback(() => {
    if (totalCount <= 0) return;
    setActiveIndexState((prev) => Math.min(prev + 1, totalCount - 1));
  }, [totalCount]);

  const goPrev = useCallback(() => {
    setActiveIndexState((prev) => Math.max(prev - 1, 0));
  }, []);

  return { activeIndex, setActiveIndex, goNext, goPrev };
}
