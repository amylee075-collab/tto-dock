"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { buildSegments } from "@/components/reading/CoreWordMode";
import { CORE_WORD_QUIZ_ITEMS } from "@/lib/coreWordPractice";
import Link from "next/link";

const WRONG_FEEDBACK =
  "아직 정답이 아니에요. 문장의 핵심이 되는 단어를 다시 골라 보세요. 한 번 더 생각해 볼까요? 🐾";

const TOTAL = CORE_WORD_QUIZ_ITEMS.length;

/** 정답 시 반짝이는 입자 효과 */
function ParticleBurst({ onComplete }: { onComplete: () => void }) {
  const count = 12;
  useEffect(() => {
    const t = setTimeout(onComplete, 800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-[20px]">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
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
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

export default function CoreWordPractice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [wrongWordKey, setWrongWordKey] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const item = CORE_WORD_QUIZ_ITEMS[currentIndex];
  const isLast = currentIndex === TOTAL - 1;
  const segments = item
    ? buildSegments(item.sentence, item.selectableWords)
    : [];

  const handleWordClick = (wordKey: string) => {
    if (!item) return;
    setFeedback(null);
    setWrongWordKey(null);
    if (wordKey === item.correctAnswer) {
      setFeedback("correct");
      setShowParticles(true);
    } else {
      setFeedback("wrong");
      setWrongWordKey(wordKey);
      setTimeout(() => setWrongWordKey(null), 500);
    }
  };

  const goNext = () => {
    if (feedback !== "correct") return;
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setFeedback(null);
    setShowParticles(false);
  };

  const showCompletion = isLast && feedback === "correct";

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col">
      {/* 1. 상단: 스테이지 내비게이션 (진행도) */}
      <header className="px-4 pt-4 sm:pt-6 pb-2">
        <div className="max-w-4xl mx-auto">
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

      {/* 2. 중앙: 문제 안내 문구 */}
      {!showCompletion && (
        <p className="text-center font-bold text-lg sm:text-xl text-[#ff5700] px-4 py-3">
          문장의 주인공을 찾아 클릭하세요!
        </p>
      )}

      {/* 3. 중앙 메인: 디자인된 퀴즈 문장 카드 */}
      <section className="flex-1 flex flex-col gap-6 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-8">
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
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative rounded-[20px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden min-h-[200px]"
                style={{
                  backgroundImage: `radial-gradient(circle, #e8e8e8 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                  backgroundColor: "#ffffff",
                }}
              >
                {showParticles && (
                  <ParticleBurst onComplete={() => setShowParticles(false)} />
                )}
                <div className="relative p-8 sm:p-10">
                  <p
                    className="text-[32px] sm:text-[36px] leading-relaxed tracking-wide text-[#212529]"
                    style={{ lineHeight: 1.8 }}
                  >
                    {segments.map((seg, i) => {
                      if (seg.type === "text") {
                        if (segments[i - 1]?.type === "word") return null;
                        return <span key={i}>{seg.text}</span>;
                      }
                      const nextText =
                        segments[i + 1]?.type === "text"
                          ? segments[i + 1].text
                          : "";
                      const isCorrectHighlight =
                        feedback === "correct" &&
                        seg.wordKey === item.correctAnswer;
                      const isWrong = wrongWordKey === seg.wordKey;
                      return (
                        <span
                          key={i}
                          className="inline"
                          style={{ whiteSpace: "normal" }}
                        >
                          <motion.button
                            type="button"
                            onClick={() => handleWordClick(seg.wordKey)}
                            className={`m-0 inline-flex align-baseline rounded-full border-2 px-3 py-1.5 text-[32px] sm:text-[36px] font-medium leading-inherit transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ff5700]/50 focus:ring-offset-2
                              ${
                                isCorrectHighlight
                                  ? "border-[#ff5700] bg-[#ff5700]/15 text-[#ff5700]"
                                  : isWrong
                                    ? "border-red-500 bg-red-50 text-red-700 animate-shake"
                                    : "border-gray-200 bg-white text-[#212529] hover:border-[#ff5700] hover:bg-[#fff5f0] hover:text-[#ff5700]"
                              }`}
                            whileHover={!feedback ? { scale: 1.05 } : {}}
                            whileTap={!feedback ? { scale: 0.98 } : {}}
                          >
                            {seg.displayLabel}
                          </motion.button>
                          {nextText}
                        </span>
                      );
                    })}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showCompletion && item && (
            <div className="mt-6 flex justify-center">
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

        {/* 4. 하단: 캐릭터 + 말풍선 (정답 시 기뻐하는 모션) */}
        {(feedback === "correct" || feedback === "wrong") && !showCompletion && (
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 w-full max-w-xl mx-auto"
          >
            <div className="rounded-2xl bg-[#fff5f0] border border-[#ff5700]/20 p-6 flex flex-col sm:flex-row items-center gap-4">
              <motion.span
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#ff5700]/20 bg-white shadow-sm"
                animate={
                  feedback === "correct"
                    ? {
                        scale: [1, 1.15, 1],
                        transition: {
                          duration: 0.5,
                          ease: "easeOut",
                        },
                      }
                    : {}
                }
              >
                {!avatarError ? (
                  <Image
                    src="/images/character.png"
                    alt="똑똑이"
                    width={80}
                    height={80}
                    className="w-full h-auto object-contain object-top"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="text-4xl" aria-hidden>
                    🦊
                  </span>
                )}
              </motion.span>
              <div className="flex-1 text-center sm:text-left">
                <div className="relative inline-block rounded-2xl border border-[#ff5700]/20 bg-white px-4 py-3 shadow-sm">
                  <p
                    className={`font-medium text-base leading-relaxed ${
                      feedback === "correct"
                        ? "text-[#212529]"
                        : "text-red-700"
                    }`}
                  >
                    {feedback === "correct"
                      ? item.correctFeedback
                      : WRONG_FEEDBACK}
                  </p>
                  <span
                    className="absolute -left-2 top-8 sm:top-1/2 sm:-translate-y-1/2 h-4 w-4 rotate-45 border-l border-b border-[#ff5700]/20 bg-white"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </section>
    </div>
  );
}
