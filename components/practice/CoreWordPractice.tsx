"use client";

/**
 * 핵심 단어 찾기 - 원본 텍스트 보존형
 * 문장을 split하지 않고, 정답/오답 키워드 위치만 찾아 해당 부분만 .training-word-card span으로 감쌈.
 */
import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { CoreWordQuizItem } from "@/lib/coreWordPractice";
import { CORE_WORD_QUIZ_ITEMS } from "@/lib/coreWordPractice";
import Link from "next/link";

export type SentenceSegment =
  | { type: "text"; content: string }
  | { type: "keyword"; content: string; wordKey: string; isCorrect: boolean };

/**
 * 문장 원문을 유지한 채, selectableWords 등장 위치만 찾아
 * [텍스트][키워드][텍스트]... 세그먼트 배열로 만듦. 겹치면 긴 단어 우선.
 * 각 키워드 occurrence는 렌더 시 인덱스(i)로 구분해 중복 단어 클릭 시 해당 위치만 반응.
 */
function buildSegmentsFromSentence(
  sentence: string,
  selectableWords: string[],
  correctAnswer: string
): SentenceSegment[] {
  if (!sentence || selectableWords.length === 0) {
    return [{ type: "text", content: sentence }];
  }
  const sorted = [...selectableWords].sort((a, b) => b.length - a.length);
  const ranges: { start: number; end: number; wordKey: string }[] = [];

  for (const word of sorted) {
    let pos = 0;
    while (pos < sentence.length) {
      const idx = sentence.indexOf(word, pos);
      if (idx === -1) break;
      const overlaps = ranges.some(
        (r) => !(idx >= r.end || idx + word.length <= r.start)
      );
      if (!overlaps) {
        ranges.push({
          start: idx,
          end: idx + word.length,
          wordKey: word,
        });
      }
      pos = idx + 1;
    }
  }

  ranges.sort((a, b) => a.start - b.start);

  const segments: SentenceSegment[] = [];
  let lastEnd = 0;
  for (const r of ranges) {
    if (r.start > lastEnd) {
      segments.push({
        type: "text",
        content: sentence.slice(lastEnd, r.start),
      });
    }
    segments.push({
      type: "keyword",
      content: sentence.slice(r.start, r.end),
      wordKey: r.wordKey,
      isCorrect: r.wordKey === correctAnswer,
    });
    lastEnd = r.end;
  }
  if (lastEnd < sentence.length) {
    segments.push({ type: "text", content: sentence.slice(lastEnd) });
  }
  return segments;
}


/** 정답/오답 피드백 모달 - 배경 dim, 둥근 모서리, X·확인으로 닫기 */
function FeedbackModal({
  isOpen,
  onClose,
  type,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "correct" | "wrong";
  message: string;
}) {
  const [avatarError, setAvatarError] = useState(false);
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="feedback-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-3 sm:p-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#212529] transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 sm:p-8 pb-6 pt-0 flex flex-col items-center text-center">
          <span className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-visible mb-4">
            {!avatarError ? (
              <Image
                src="/images/character.png"
                alt=""
                width={120}
                height={120}
                className="w-full h-full object-contain object-center"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-5xl" aria-hidden>🦊</span>
            )}
          </span>
          <p
            id="feedback-modal-title"
            className={`text-lg sm:text-xl font-bold leading-relaxed ${
              type === "correct" ? "text-[#212529]" : "text-red-700"
            }`}
          >
            {message}
          </p>
        </div>
        <div className="px-6 sm:p-8 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-3.5 font-bold text-white bg-[#ff5700] hover:opacity-90 transition-opacity"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticleBurst({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 800);
    return () => clearTimeout(t);
  }, [onComplete]);
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-[20px]">
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 80;
        const y = Math.sin(rad) * 80;
        return (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-[#ff5700] shadow-lg"
            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: [0, 1.2, 0],
              opacity: [1, 0.8, 0],
              x: [0, x],
              y: [0, y],
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

type Props = { items?: CoreWordQuizItem[] };

export default function CoreWordPractice({ items: itemsProp }: Props) {
  const items = itemsProp ?? CORE_WORD_QUIZ_ITEMS;
  const TOTAL = items.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [wrongSegmentId, setWrongSegmentId] = useState<number | null>(null);
  const [selectedWordKey, setSelectedWordKey] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const item = items[currentIndex];
  const isLast = currentIndex === TOTAL - 1;
  const correctAnswer = item?.correctAnswer ?? "";
  const segments: SentenceSegment[] = item
    ? buildSegmentsFromSentence(
        item.sentence,
        item.selectableWords,
        correctAnswer
      )
    : [];

  const handleKeywordClick = (
    segmentIndex: number,
    isCorrect: boolean,
    wordKey: string
  ) => {
    if (!item) return;
    setFeedback(null);
    setWrongSegmentId(null);
    setSelectedWordKey(wordKey);
    if (isCorrect) {
      setFeedback("correct");
      setShowParticles(true);
      setFeedbackModalOpen(true);
    } else {
      setFeedback("wrong");
      setWrongSegmentId(segmentIndex);
      setFeedbackModalOpen(true);
    }
  };

  const goNext = () => {
    if (feedback !== "correct") return;
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setFeedback(null);
    setFeedbackModalOpen(false);
    setSelectedWordKey(null);
    setWrongSegmentId(null);
    setShowParticles(false);
  };

  const showCompletion = isLast && feedback === "correct";

  const sentenceNodes: ReactNode[] = [];
  segments.forEach((seg, i) => {
    if (seg.type === "text") {
      sentenceNodes.push(
        <span key={i} className="inline" style={{ margin: 0, padding: 0 }}>
          {seg.content}
        </span>
      );
      return;
    }
    const isCorrectSelected = feedback === "correct" && seg.isCorrect;
    const isWrong = wrongSegmentId === i;
    sentenceNodes.push(
      <motion.button
        key={i}
        type="button"
        onClick={() => handleKeywordClick(i, seg.isCorrect, seg.wordKey)}
        className={`inline m-0 border-0 p-0 text-xl md:text-3xl leading-inherit tracking-normal outline-none ring-0 focus:outline-none focus:ring-0 text-[#212529] font-medium bg-transparent ${isWrong ? "animate-shake text-red-700" : ""}`}
        style={{ margin: 0, padding: 0 }}
        whileTap={!feedback ? { scale: 0.99 } : {}}
      >
        <span
          className={`training-word-card ${isCorrectSelected ? "selected" : isWrong ? "wrong" : ""}`}
          style={{ margin: 0 }}
        >
          {seg.content}
        </span>
      </motion.button>
    );
  });

  return (
    <div className="w-full flex flex-col min-h-0">
      <header className="pt-2 sm:pt-0 pb-0 shrink-0">
        <div className="w-full">
          <h1 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-1.5">
            핵심 단어 찾기
          </h1>
          {!showCompletion && (
            <p className="core-word-instruction font-medium mb-2" style={{ fontSize: "1.4rem", color: "#ff5700" }}>
              문장을 또박또박 읽고 핵심 단어를 찾아 클릭해 보세요!
            </p>
          )}
          <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-1.5">
            <span>문제 {currentIndex + 1} / {TOTAL}</span>
            <span>{Math.round(((currentIndex + 1) / TOTAL) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#ff5700]"
              initial={false}
              animate={{ width: `${((currentIndex + 1) / TOTAL) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-y-5 w-full pb-6 min-h-0">
        <div className="w-full min-w-0 min-h-0">
          <AnimatePresence mode="wait">
            {showCompletion ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-[20px] bg-white shadow-lg border border-gray-100 p-8 text-center"
              >
                <p className="text-xl sm:text-2xl font-bold text-[#212529] mb-2">
                  모든 문제를 완료했어요!
                </p>
                <p className="text-gray-600 mb-6">
                  핵심 단어 찾기 연습을 잘 마쳤어요. 다음에도 또 도전해 보세요.
                </p>
                <Link
                  href="/"
                  className="inline-flex rounded-xl bg-[#ff5700] px-6 py-3 font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                >
                  홈으로 가기
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={item?.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative rounded-2xl overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] max-h-[min(50vh,420px)] flex flex-col"
              >
                {showParticles && (
                  <ParticleBurst onComplete={() => setShowParticles(false)} />
                )}
                <div className="relative p-4 sm:p-5 md:p-6 overflow-y-auto min-h-0 flex-1">
                  <p
                    className="text-xl md:text-2xl text-[#212529] tracking-normal break-keep leading-[2] md:leading-[2.5]"
                    style={{ margin: 0, padding: 0 }}
                  >
                    {sentenceNodes}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showCompletion && item && (
            <div className="mt-5 mb-2 flex justify-center shrink-0">
              <button
                type="button"
                onClick={goNext}
                disabled={feedback !== "correct"}
                className="rounded-xl px-8 py-3.5 font-bold text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:bg-[#ff5700] enabled:hover:opacity-90"
              >
                다음 문제로
              </button>
            </div>
          )}
        </div>

        {!showCompletion && item && (feedback === "correct" || feedback === "wrong") && (
          <FeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => setFeedbackModalOpen(false)}
            type={feedback}
            message={
              feedback === "correct"
                ? (selectedWordKey && item.feedbackByWord[selectedWordKey]
                    ? item.feedbackByWord[selectedWordKey]
                    : item.feedbackByWord[item.correctAnswer]) ?? "정답이에요!"
                : (selectedWordKey && item.feedbackByWord[selectedWordKey]
                    ? item.feedbackByWord[selectedWordKey]
                    : "다시 생각해보자!") ?? "다시 생각해보자!"
            }
          />
        )}
      </section>
    </div>
  );
}
