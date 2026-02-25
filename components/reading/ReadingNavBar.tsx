"use client";

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
  const nextEnabled = nextLabel !== "다음" ? true : hasNext;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 border-t border-gray-100 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm safe-area-pb ${className}`}
      aria-label="문장 내비게이션"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className="min-w-[72px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#212529] transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:border-[#ff5700]/40 hover:enabled:bg-[#fff5f0]"
        aria-label="이전 문장"
      >
        이전
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!nextEnabled}
        className="min-w-[72px] rounded-xl bg-[#ff5700] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:opacity-90"
        aria-label={nextLabel === "퀴즈 풀기" ? "퀴즈로 이동" : "다음 문장"}
      >
        {nextLabel}
      </button>
    </nav>
  );
}
