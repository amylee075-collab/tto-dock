"use client";

import { useSidebar } from "@/contexts/SidebarContext";

/** 버튼 바 높이: 본문 하단 패딩 계산용 (py-3 + min-h 버튼 ≈ 4.5rem) */
export const READING_NAV_BAR_HEIGHT_REM = 4.5;

interface ReadingNavBarProps {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  /** 마지막 문장일 때 버튼 문구(예: "퀴즈 풀기"). 있으면 hasNext와 무관하게 다음 버튼 활성화. */
  nextLabel?: string;
  className?: string;
}

export default function ReadingNavBar({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  nextLabel = "다음",
  className = "",
}: ReadingNavBarProps) {
  const { collapsed } = useSidebar();
  const nextEnabled = nextLabel !== "다음" ? true : hasNext;

  return (
    <nav
      className={`fixed left-0 right-0 z-[90] flex items-center justify-center gap-3 border-t border-orange-100 bg-white/95 backdrop-blur-sm px-4 py-3 touch-manipulation md:bottom-0 ${collapsed ? "md:left-20 md:w-[calc(100%-5rem)]" : "md:left-64 md:w-[calc(100%-16rem)]"} ${className}`}
      style={{
        touchAction: "manipulation",
        bottom: "var(--reading-nav-bottom, 0)",
      } as React.CSSProperties}
      aria-label="문장 내비게이션"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className="min-h-[48px] min-w-[80px] rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#212529] transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:border-[#ff5700]/40 hover:enabled:bg-[#fff5f0] active:enabled:scale-[0.98] touch-manipulation"
        style={{ touchAction: "manipulation" }}
        aria-label="이전 문장"
      >
        이전
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!nextEnabled}
        className="min-h-[48px] min-w-[80px] rounded-xl bg-[#ff5700] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:opacity-90 active:enabled:scale-[0.98] touch-manipulation"
        style={{ touchAction: "manipulation" }}
        aria-label={nextLabel === "퀴즈 풀기" ? "퀴즈로 이동" : "다음 문장"}
      >
        {nextLabel}
      </button>
    </nav>
  );
}
