"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CPMTier, CPMStatus } from "@/lib/hooks/useCPM";
import { useReadingTimer } from "@/lib/hooks/useReadingTimer";

interface ReadingSidebarProps {
  cpm: number;
  tier: CPMTier;
  tierLabel: string;
  tierMessage: string;
  readCount: number;
  totalSentences: number;
  cpmStatus?: CPMStatus;
  readingStarted?: boolean;
  /** 30초/45초 경과 시 읽은 문장 1개 이하일 때 안내 문구 (작은 툴팁) */
  slowStartHint?: string | null;
  className?: string;
  /** 모바일: 상단 접이식(아코디언)으로 렌더 */
  asAccordion?: boolean;
}

const ORANGE = "#FF5C00";
/** CPM 게이지 최대값(이 값이면 100% 채움) */
const CPM_GAUGE_MAX = 1000;
/** 카운트업/다운 애니메이션 시간(ms) */
const CPM_ANIM_DURATION_MS = 500;

const tierClass: Record<CPMTier, string> = {
  차근차근: "bg-blue-100 text-blue-800 border-blue-200",
  안정적: "bg-[#fff5f0] text-[#FF5C00] border-[#FF5C00]/30",
  빠름: "bg-amber-50 text-amber-800 border-amber-200",
  "매우 빠름": "bg-red-50 text-red-700 border-red-200",
};

/** 읽기 속도 게이지 바 색상 (티어별 실시간 연동) */
const tierGaugeColor: Record<CPMTier, string> = {
  차근차근: "#3B82F6",
  안정적: "#10B981",
  빠름: "#F59E0B",
  "매우 빠름": "#A855F7",
};

export default function ReadingSidebar({
  cpm,
  tier,
  tierLabel,
  tierMessage,
  readCount,
  totalSentences,
  cpmStatus = "ready",
  readingStarted = true,
  slowStartHint = null,
  className = "",
  asAccordion = false,
}: ReadingSidebarProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [displayCpm, setDisplayCpm] = useState(cpm);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const prevCpmRef = useRef(cpm);
  const animRef = useRef<number | null>(null);
  const elapsed = useReadingTimer(readingStarted);
  const progressPercent =
    totalSentences > 0 ? Math.round((readCount / totalSentences) * 100) : 0;
  const isMeasuring = cpmStatus === "measuring";
  const cpmGaugePercent =
    isMeasuring || displayCpm <= 0 ? 0 : Math.min(100, (displayCpm / CPM_GAUGE_MAX) * 100);

  // 0.5초 동안 이전 값 → 새 값으로 서서히 변하는 카운트업/다운
  useEffect(() => {
    if (isMeasuring) {
      setDisplayCpm(0);
      prevCpmRef.current = 0;
      return;
    }
    const target = cpm;
    if (target === prevCpmRef.current) return;
    const start = prevCpmRef.current;
    const startTime = performance.now();
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / CPM_ANIM_DURATION_MS);
      const ease = 1 - (1 - t) * (1 - t);
      const value = Math.round(start + (target - start) * ease);
      setDisplayCpm(value);
      prevCpmRef.current = value;
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else animRef.current = null;
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [cpm, isMeasuring]);

  useEffect(() => {
    if (!isMeasuring) prevCpmRef.current = cpm;
  }, [cpm, isMeasuring]);

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

        {/* 2. 읽은 문장 (목표 달성형) — 수치 바로 아래 주황색 진행 바 + 총 문장 수만큼 세로 눈금 */}
        <div className="mb-4">
          <p className="font-extrabold text-xl text-[#212529] tabular-nums">
            읽은 문장{" "}
            <span className="text-[#FF5C00]">
              {readCount} / {totalSentences}
            </span>
          </p>
          <div className="mt-2 relative h-[8px] rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full absolute left-0 top-0"
              style={{ backgroundColor: ORANGE }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* 총 문장 수만큼 등분된 세로 눈금 (흐린 흰색) */}
            {totalSentences > 1 &&
              Array.from({ length: totalSentences - 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-white/50 pointer-events-none"
                  style={{ left: `${((i + 1) / totalSentences) * 100}%` }}
                  aria-hidden
                />
              ))}
          </div>
        </div>

        {/* 3. 읽기 속도 (CPM) — 수직 적층, 간격 1.3rem 통일 */}
        <div
          className="pt-4 border-t border-gray-100 flex flex-col"
          style={{ gap: "1.3rem" }}
        >
          {/* 첫 번째 줄: 타이틀 + 글자/분 수치 (폰트 사이즈·굵기 유지) */}
          <div className="flex flex-col gap-0.5">
            <p className="text-base font-medium text-gray-500">읽기 속도</p>
            <motion.p
              className="font-extrabold text-2xl sm:text-3xl text-[#212529] tabular-nums"
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isMeasuring ? (
                <span className="text-gray-500 font-medium text-lg sm:text-xl">
                  측정 중...
                </span>
              ) : (
                <>
                  <motion.span
                    key={displayCpm}
                    initial={false}
                    transition={{ duration: 0.15 }}
                  >
                    {displayCpm}
                  </motion.span>
                  <span className="text-lg font-medium text-gray-500 ml-1">
                    글자 / 분
                  </span>
                </>
              )}
            </motion.p>
          </div>

          {/* 두 번째 줄: 티어 라벨 (시인성 강화 — 패딩 확대, 전체 너비와 조화) */}
          {!isMeasuring && (
            <span
              className={`inline-flex w-fit max-w-full rounded-lg border px-3 py-1.5 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis ${tierClass[tier]}`}
              title={tierLabel}
              style={{ minWidth: 0 }}
            >
              {tierLabel}
            </span>
          )}

          {/* 세 번째 줄: 읽기 속도 상태형 게이지 (얇은 바, 티어별 색상, 부드러운 애니메이션) */}
          <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: isMeasuring ? "#E5E7EB" : tierGaugeColor[tier],
              }}
              initial={false}
              animate={{ width: `${cpmGaugePercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* 네 번째 줄: 또독이 아이콘 + 피드백 메시지 (한 줄 flex-row, 수직 중앙 정렬) */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-row items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-[#fff5f0]">
                {!avatarError ? (
                  <Image
                    src="/images/character.png"
                    alt="또독이"
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
              <p className="text-base font-medium text-[#212529] leading-snug min-w-0 flex-1 break-words">
                {!readingStarted
                  ? "읽기 시작을 누르면 측정이 시작돼요."
                  : isMeasuring
                  ? "몇 문장 더 읽으면 속도가 표시돼요."
                  : tierMessage}
              </p>
            </div>
            {slowStartHint && (
              <p className="text-sm text-gray-500 pl-[3.25rem] leading-snug" role="status">
                {slowStartHint}
              </p>
            )}
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
          className="w-full flex items-center justify-between gap-3 py-4 px-4 sm:px-5 text-left font-semibold text-[#212529] hover:bg-gray-50 transition-colors min-h-[3.25rem]"
          aria-expanded={accordionOpen}
        >
          <span className="min-w-0 truncate">학습 진행률</span>
          <span className="flex items-center gap-2 shrink-0 text-gray-400 text-sm tabular-nums">
            {readCount} / {totalSentences} · {elapsed}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${accordionOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
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
