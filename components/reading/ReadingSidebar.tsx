"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WPMTier, WPMStatus } from "@/lib/hooks/useWPM";
import { useReadingTimer } from "@/lib/hooks/useReadingTimer";

interface ReadingSidebarProps {
  wpm: number;
  tier: WPMTier;
  readCount: number;
  totalSentences: number;
  wpmStatus?: WPMStatus;
  className?: string;
  /** 모바일: 상단 접이식(아코디언)으로 렌더 */
  asAccordion?: boolean;
}

const ORANGE = "#FF5C00";
/** WPM 게이지 최대값(이 값이면 100% 채움) */
const WPM_GAUGE_MAX = 250;
/** 카운트업/다운 애니메이션 시간(초) */
const WPM_ANIM_DURATION_MS = 500;

const tierConfig: Record<
  WPMTier,
  { label: string; className: string; feedback: string }
> = {
  느림: {
    label: "느림",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    feedback: "천천히 꼼꼼하게 읽어봐요!",
  },
  보통: {
    label: "보통",
    className: "bg-[#fff5f0] text-[#FF5C00] border-[#FF5C00]/30",
    feedback: "적당한 속도로 잘 읽고 있어요!",
  },
  빠름: {
    label: "빠름",
    className: "bg-red-50 text-red-700 border-red-200",
    feedback: "너무 빨라요! 천천히 읽어봐요",
  },
};

export default function ReadingSidebar({
  wpm,
  tier,
  readCount,
  totalSentences,
  wpmStatus = "ready",
  className = "",
  asAccordion = false,
}: ReadingSidebarProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [displayWpm, setDisplayWpm] = useState(wpm);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const prevWpmRef = useRef(wpm);
  const animRef = useRef<number | null>(null);
  const elapsed = useReadingTimer();
  const config = tierConfig[tier];
  const progressPercent =
    totalSentences > 0 ? Math.round((readCount / totalSentences) * 100) : 0;
  const isMeasuring = wpmStatus === "measuring";
  const wpmGaugePercent =
    isMeasuring || displayWpm <= 0 ? 0 : Math.min(100, (displayWpm / WPM_GAUGE_MAX) * 100);

  // 0.5초 동안 이전 값 → 새 값으로 서서히 변하는 카운트업/다운
  useEffect(() => {
    if (isMeasuring) {
      setDisplayWpm(0);
      prevWpmRef.current = 0;
      return;
    }
    const target = wpm;
    if (target === prevWpmRef.current) return;
    const start = prevWpmRef.current;
    const startTime = performance.now();
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / WPM_ANIM_DURATION_MS);
      const ease = 1 - (1 - t) * (1 - t);
      const value = Math.round(start + (target - start) * ease);
      setDisplayWpm(value);
      prevWpmRef.current = value;
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else animRef.current = null;
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [wpm, isMeasuring]);

  useEffect(() => {
    if (!isMeasuring) prevWpmRef.current = wpm;
  }, [wpm, isMeasuring]);

  const contentCard = (
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 min-w-0 overflow-hidden">
        <h2 className="text-xl font-bold text-[#212529] mb-4">
          학습 진행률
        </h2>

        {/* 1. 읽은 시간 (Timer) */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600"
            aria-hidden
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <span className="font-bold text-xl text-[#212529] tabular-nums">
            {elapsed}
          </span>
        </div>

        {/* 2. 읽은 문장 (Progress) */}
        <div className="mb-4">
          <p className="font-extrabold text-xl text-[#212529] tabular-nums">
            읽은 문장{" "}
            <span className="text-[#FF5C00]">
              {readCount} / {totalSentences}
            </span>
          </p>
          <div className="mt-2 h-3 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: ORANGE }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 3. 읽기 속도 (WPM) + 상태 태그 + 캐릭터 피드백 */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-base font-medium text-gray-500 mb-2">읽기 속도</p>
          <div className="flex items-center gap-2 mb-2">
            <motion.p
              className="font-extrabold text-2xl sm:text-3xl text-[#212529] tabular-nums min-w-[4rem]"
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isMeasuring ? (
                <span className="text-gray-500 font-medium text-lg sm:text-xl">
                  측정 중...
                </span>
              ) : (
                <motion.span
                  key={displayWpm}
                  initial={false}
                  transition={{ duration: 0.15 }}
                >
                  {displayWpm}
                </motion.span>
              )}
              {!isMeasuring && (
                <span className="text-lg font-medium text-gray-500 ml-1">
                  WPM
                </span>
              )}
            </motion.p>
            {!isMeasuring && (
              <span
                className={`inline-flex rounded-lg border px-2.5 py-1 text-sm font-medium ${config.className}`}
              >
                {config.label}
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: ORANGE }}
              initial={false}
              animate={{ width: `${wpmGaugePercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-[#fff5f0]">
              {!avatarError ? (
                <Image
                  src="/images/character.png"
                  alt="똑똑이"
                  width={40}
                  height={40}
                  className="w-full h-auto object-contain object-top"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-xl" aria-hidden>
                  🦊
                </span>
              )}
            </span>
            <p className="text-base font-medium text-[#212529] leading-snug">
              {isMeasuring
                ? "몇 문장 더 읽으면 속도가 표시돼요."
                : config.feedback}
            </p>
          </div>
        </div>
      </div>
    );

  if (asAccordion) {
    return (
      <div className={`w-full border-b border-gray-200 bg-white ${className}`}>
        <button
          type="button"
          onClick={() => setAccordionOpen((o) => !o)}
          className="w-full flex items-center justify-between py-4 px-4 text-left font-semibold text-[#212529] hover:bg-gray-50 transition-colors"
          aria-expanded={accordionOpen}
        >
          <span>학습 진행률</span>
          <span className="text-gray-400 text-sm">
            {readCount} / {totalSentences} · {elapsed}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${accordionOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence initial={false}>
          {accordionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">{contentCard}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <aside
      className={`w-full lg:w-64 lg:max-w-[16rem] shrink-0 pt-6 lg:pt-8 lg:sticky lg:top-24 lg:self-start border-t lg:border-t-0 border-gray-200 min-w-0 z-0 ${className}`}
    >
      {contentCard}
    </aside>
  );
}
