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
    } else {
      setFeedback("wrong");
      setWrongSegmentId(segmentIndex);
      setTimeout(() => setWrongSegmentId(null), 500);
    }
  };

  const goNext = () => {
    if (feedback !== "correct") return;
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setFeedback(null);
    setSelectedWordKey(null);
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
    <div className="w-full flex flex-col h-auto">
      <header className="pt-4 sm:pt-6 pb-2">
        <div className="w-full">
          <h1 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-3">
            핵심 단어 찾기
          </h1>
          <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
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

      {!showCompletion && (
        <p className="text-center font-bold text-lg text-[#ff5700] py-8">
          문장의 주인공을 찾아 클릭하세요!
        </p>
      )}

      <section className="flex flex-col gap-y-10 w-full pb-8">
        <div className="w-full min-w-0">
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
                className="relative rounded-2xl overflow-hidden h-auto bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                {showParticles && (
                  <ParticleBurst onComplete={() => setShowParticles(false)} />
                )}
                <div className="relative p-6 sm:p-8 md:p-10">
                  <p
                    className="text-xl md:text-3xl text-[#212529] tracking-normal break-keep leading-[2.5] md:leading-[3.5]"
                    style={{ margin: 0, padding: 0 }}
                  >
                    {sentenceNodes}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showCompletion && item && (
            <div className="mt-8 mb-4 flex justify-center">
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

        {(feedback === "correct" || feedback === "wrong") && !showCompletion && item && (
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 w-full max-w-xl mx-auto px-2"
          >
            <div
              className={`rounded-2xl bg-[#fff5f0] border border-[#ff5700]/20 flex items-center gap-3 ${
                feedback === "correct" ? "p-4" : "p-4 flex-col sm:flex-row"
              }`}
            >
              {feedback === "correct" ? (
                <>
                  <motion.span
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#ff5700]/20 bg-white shadow-sm"
                    animate={{
                      scale: [1, 1.1, 1],
                      transition: { duration: 0.4, ease: "easeOut" },
                    }}
                  >
                    {!avatarError ? (
                      <Image
                        src="/images/character.png"
                        alt="또독이"
                        width={56}
                        height={56}
                        className="w-full h-auto object-contain object-top"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="text-3xl" aria-hidden>🦊</span>
                    )}
                  </motion.span>
                  <p className="font-bold text-[#212529] text-base leading-relaxed">
                    {selectedWordKey && item.feedbackByWord[selectedWordKey]
                      ? item.feedbackByWord[selectedWordKey]
                      : item.feedbackByWord[item.correctAnswer]}
                  </p>
                </>
              ) : (
                <>
                  <motion.span
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#ff5700]/20 bg-white shadow-sm"
                  >
                    {!avatarError ? (
                      <Image
                        src="/images/character.png"
                        alt="또독이"
                        width={56}
                        height={56}
                        className="w-full h-auto object-contain object-top"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="text-3xl" aria-hidden>🦊</span>
                    )}
                  </motion.span>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <p className="font-medium text-red-700 text-base leading-relaxed">
                      {selectedWordKey && item.feedbackByWord[selectedWordKey]
                        ? item.feedbackByWord[selectedWordKey]
                        : "다시 생각해보자!"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        )}
      </section>
    </div>
  );
}
