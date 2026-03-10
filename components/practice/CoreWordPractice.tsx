"use client";

/**
 * 핵심 단어 찾기 - 원본 텍스트 보존형
 * 문장을 split하지 않고, 정답/오답 키워드 위치만 찾아 해당 부분만 .training-word-card span으로 감쌈.
 */
import { useState, useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { CoreWordQuizItem } from "@/lib/coreWordPractice";
import { CORE_WORD_QUIZ_ITEMS } from "@/lib/coreWordPractice";
import Link from "next/link";
import ConfettiEffect from "@/components/reading/ConfettiEffect";

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


/** 정답/오답 피드백 모달 — 부드러운 트랜지션, 1회차 오답 vs 2회차(정답 공개) 구분 */
function FeedbackModal({
  isOpen,
  onClose,
  type,
  message,
  subMessage,
  showConfirm = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "correct" | "wrong" | "reveal";
  message: string;
  /** 두 번째 줄 — 어드민 단어별 피드백 등 */
  subMessage?: string;
  showConfirm?: boolean;
}) {
  const [avatarError, setAvatarError] = useState(false);
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="feedback-modal-title"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
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
                type === "correct" ? "text-[#212529]" : type === "reveal" ? "text-amber-800" : "text-red-700"
              }`}
            >
              {message}
            </p>
            {subMessage && (
              <p className="mt-2 text-base text-gray-600 leading-relaxed">
                {subMessage}
              </p>
            )}
          </div>
          {showConfirm && (
            <div className="px-6 sm:p-8 pb-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl py-3.5 font-bold text-white bg-[#ff5700] hover:opacity-90 transition-opacity"
              >
                확인
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
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

const getItemQuizId = (item: CoreWordQuizItem): string =>
  item.quizId ?? `local-${item.id}`;

type Props = {
  items?: CoreWordQuizItem[];
  /** 정답 시 해당 문항 ID 저장용 (데일리 순환에서 제외) */
  onCorrect?: (quizId: string) => void;
  /** 2회 오답 후 정답 공개하고 넘어간 경우 — 학습 리포트용 isCorrect: false 기록 */
  onWrong?: (quizId: string) => void;
  /** 오늘 10문제 전체 완료 시 호출 (저장용) */
  onComplete?: (quizIds: string[]) => void;
};

const MESSAGE_FIRST_WRONG = "아쉬워요!";
const MESSAGE_SECOND_WRONG = (answer: string) => `정답은 ${answer}입니다!`;

export default function CoreWordPractice({ items: itemsProp, onCorrect, onComplete, onWrong }: Props) {
  const items = itemsProp ?? CORE_WORD_QUIZ_ITEMS;
  const TOTAL = items.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "reveal" | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [wrongSegmentId, setWrongSegmentId] = useState<number | null>(null);
  const [selectedWordKey, setSelectedWordKey] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  /** 팝업 오픈 시 Supabase에서 최신 feedback_by_word만 재조회하여 즉시 반영 */
  const [latestFeedbackByQuizId, setLatestFeedbackByQuizId] = useState<
    Record<string, Record<string, string>>
  >({});
  const completedFiredRef = useRef(false);
  const answerRevealed = attempts >= 2;

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

  useEffect(() => {
    setAttempts(0);
    setFeedback(null);
    setWrongSegmentId(null);
    setSelectedWordKey(null);
  }, [currentIndex]);

  useEffect(() => {
    if (!feedbackModalOpen) return;
    const quizId = item?.quizId;
    if (!quizId) return;
    let cancelled = false;

    fetch(`/api/practice/core-word/feedback?quizId=${encodeURIComponent(quizId)}`, {
      cache: "no-store",
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (cancelled || !data || typeof data !== "object") return;
        const d = data as { quizId?: unknown; feedbackByWord?: unknown };
        if (typeof d.quizId !== "string" || d.quizId !== quizId) return;
        const fb = d.feedbackByWord;
        if (!fb || typeof fb !== "object" || Array.isArray(fb)) return;
        setLatestFeedbackByQuizId((prev) => ({ ...prev, [quizId]: fb as Record<string, string> }));
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
    };
  }, [feedbackModalOpen, item?.quizId]);

  const feedbackByWord =
    item?.quizId && latestFeedbackByQuizId[item.quizId]
      ? latestFeedbackByQuizId[item.quizId]!
      : item?.feedbackByWord ?? {};

  const handleKeywordClick = (
    segmentIndex: number,
    isCorrect: boolean,
    wordKey: string
  ) => {
    if (!item || answerRevealed) return;
    setSelectedWordKey(wordKey);
    if (isCorrect) {
      setFeedback("correct");
      setShowParticles(true);
      setFeedbackModalOpen(true);
      onCorrect?.(getItemQuizId(item));
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setWrongSegmentId(segmentIndex);
      setFeedback(nextAttempts === 1 ? "wrong" : "reveal");
      setFeedbackModalOpen(true);
    }
  };

  const canGoNext = feedback === "correct" || answerRevealed;

  const goNext = () => {
    if (!canGoNext) return;
    if (answerRevealed && item) onWrong?.(getItemQuizId(item));
    setFeedbackModalOpen(false);
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setFeedback(null);
    setSelectedWordKey(null);
    setWrongSegmentId(null);
    setShowParticles(false);
    setAttempts(0);
  };

  const showCompletion = isLast && (feedback === "correct" || answerRevealed);

  useEffect(() => {
    if (showCompletion && items.length > 0 && !completedFiredRef.current) {
      completedFiredRef.current = true;
      if (answerRevealed && item) onWrong?.(getItemQuizId(item));
      onComplete?.(items.map(getItemQuizId));
    }
  }, [showCompletion, onComplete, onWrong, items, answerRevealed, item]);

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
    const isRevealedCorrect = answerRevealed && seg.isCorrect;
    const choiceDisabled = answerRevealed;
    sentenceNodes.push(
      <motion.button
        key={i}
        type="button"
        disabled={choiceDisabled}
        onClick={() => handleKeywordClick(i, seg.isCorrect, seg.wordKey)}
        className={`inline m-0 border-0 p-0 text-[1.44rem] md:text-[1.72rem] leading-inherit tracking-normal outline-none ring-0 focus:outline-none focus:ring-0 text-[#212529] font-medium bg-transparent ${isWrong ? "animate-shake text-red-700" : ""} ${choiceDisabled ? "cursor-default pointer-events-none" : ""}`}
        style={{ margin: 0, padding: 0 }}
        whileTap={!feedback && !choiceDisabled ? { scale: 0.99 } : {}}
      >
        <span
          className={`training-word-card text-[1.44rem] md:text-[1.72rem] ${isCorrectSelected ? "selected" : isRevealedCorrect ? "selected" : isWrong ? "wrong" : ""}`}
          style={{ margin: 0 }}
        >
          {seg.content}
        </span>
      </motion.button>
    );
  });

  return (
    <div className="w-full flex flex-col min-h-0 px-6">
      <header className="pt-2 sm:pt-0 pb-0 shrink-0">
        <div className="w-full">
          <h1 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-1.5">
            핵심 단어 찾기
          </h1>
          {!showCompletion && (
            <p className="core-word-instruction font-medium mb-3 text-[#ff5700]" style={{ fontSize: "1.4rem" }}>
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

      <section className="flex flex-col gap-y-5 w-full pb-6 min-h-0 mt-4">
        <div className="w-full min-w-0 min-h-0">
          <AnimatePresence mode="wait">
            {showCompletion ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
              >
                <ConfettiEffect />
                <div className="relative rounded-[20px] bg-white shadow-lg border border-gray-100 p-8 sm:p-10 text-center">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.35 }}
                  className="text-2xl sm:text-3xl font-extrabold text-[#212529] mb-3"
                >
                  모든 퀴즈를 풀었어요!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6"
                >
                  매일 매일 새로운 퀴즈가 제공돼요. 내일 다시 도전해 봐요!
                </motion.p>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: [0.8, 1.08, 1] }}
                  transition={{
                    delay: 0.25,
                    duration: 0.5,
                    scale: { type: "spring", stiffness: 260, damping: 14 },
                  }}
                  className="inline-flex h-24 w-24 sm:h-28 sm:w-28 mb-6 items-center justify-center rounded-full border-2 border-[#ff5700]/30 bg-[#fff5f0]"
                >
                  <Image
                    src="/images/character.png"
                    alt=""
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </motion.span>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.3 }}
                >
                  <Link
                    href="/"
                    className="inline-flex rounded-xl bg-[#ff5700] px-8 py-3.5 font-bold text-white shadow-md hover:opacity-90 transition-opacity"
                  >
                    홈으로 가기
                  </Link>
                </motion.div>
                </div>
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
                    className="text-[1.44rem] md:text-[1.72rem] text-[#212529] font-medium tracking-normal break-keep leading-[2] md:leading-[2.5] [&_.training-word-card]:text-[1.44rem] [&_.training-word-card]:md:text-[1.72rem]"
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
                disabled={!canGoNext}
                className="rounded-xl px-8 py-3.5 font-bold text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:bg-[#ff5700] enabled:hover:opacity-90"
              >
                다음 문제로
              </button>
            </div>
          )}
        </div>

        {!showCompletion && item && (feedback === "correct" || feedback === "wrong" || feedback === "reveal") && (
          <FeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => setFeedbackModalOpen(false)}
            type={feedback === "reveal" ? "reveal" : feedback}
            message={
              feedback === "correct"
                ? (selectedWordKey && feedbackByWord[selectedWordKey]
                    ? feedbackByWord[selectedWordKey]
                    : feedbackByWord[item.correctAnswer]) ?? "정답이에요!"
                : feedback === "wrong"
                  ? MESSAGE_FIRST_WRONG
                  : MESSAGE_SECOND_WRONG(correctAnswer)
            }
            subMessage={
              feedback === "wrong" && selectedWordKey
                ? feedbackByWord[selectedWordKey] ?? undefined
                : feedback === "reveal"
                  ? feedbackByWord[correctAnswer] ?? undefined
                  : undefined
            }
            showConfirm={feedback !== "reveal"}
          />
        )}
      </section>
    </div>
  );
}
