"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { ShortStory } from "@/lib/data";

interface ShortStoryQuizProps {
  story: ShortStory;
  className?: string;
}

function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, "").trim();
}

export default function ShortStoryQuiz({ story, className = "" }: ShortStoryQuizProps) {
  const { coreQuiz, readQuizzes } = story;
  const [coreInput, setCoreInput] = useState("");
  const [coreChecked, setCoreChecked] = useState<boolean | null>(null);
  const [coreDone, setCoreDone] = useState(false);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqFeedback, setMcqFeedback] = useState<"correct" | "wrong" | null>(null);

  const handleCoreCheck = () => {
    const ok =
      normalizeAnswer(coreInput) === normalizeAnswer(coreQuiz.answer);
    setCoreChecked(ok);
    if (ok) setCoreDone(true);
  };

  const currentMcq = readQuizzes[mcqIndex];
  const mcqDone = mcqIndex >= readQuizzes.length;

  const handleMcqSelect = (optionIndex: number) => {
    if (mcqFeedback !== null) return;
    const correct = optionIndex === currentMcq.ans;
    setMcqFeedback(correct ? "correct" : "wrong");
  };

  const handleMcqNext = () => {
    setMcqFeedback(null);
    setMcqIndex((i) => i + 1);
  };

  return (
    <section className={`rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-sm ${className}`}>
      <h2 className="font-bold text-lg text-[#212529] mb-6">퀴즈</h2>

      {/* 단답형 (coreQuiz) */}
      <div className="mb-8">
        <p className="text-[#212529] font-medium mb-3">{coreQuiz.question}</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={coreInput}
            onChange={(e) => {
              setCoreInput(e.target.value);
              setCoreChecked(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCoreCheck()}
            placeholder="정답을 입력하세요"
            className="rounded-lg border border-gray-200 px-4 py-2 text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/50"
            disabled={coreDone}
          />
          <button
            type="button"
            onClick={handleCoreCheck}
            disabled={coreDone}
            className="rounded-xl px-4 py-2 font-bold text-white disabled:opacity-60 bg-[#ff5700]"
          >
            정답 확인
          </button>
        </div>
        <AnimatePresence mode="wait">
          {coreChecked === true && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-[#ff5700] font-medium"
            >
              정답이에요!
            </motion.p>
          )}
          {coreChecked === false && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-red-600 font-medium"
            >
              아쉬워요. 다시 입력해 보세요.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 객관식: core 완료 후 또는 바로 표시 (요구사항에 따라 core 완료 후만) */}
      {coreDone && (
        <div className="space-y-6">
          {!mcqDone && currentMcq && (
            <div>
              <p className="text-[#212529] font-medium mb-3">
                {mcqIndex + 1}. {currentMcq.q}
              </p>
              <ul className="space-y-2">
                {currentMcq.options.map((opt, optIdx) => (
                  <li key={optIdx}>
                    <button
                      type="button"
                      onClick={() => handleMcqSelect(optIdx)}
                      disabled={mcqFeedback !== null}
                      className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors disabled:opacity-80 ${
                        mcqFeedback === null
                          ? "border-gray-100 hover:border-[#ff5700]/40 hover:bg-[#fff5f0]"
                          : optIdx === currentMcq.ans
                            ? "border-green-500 bg-green-50 text-green-800"
                            : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>

              <AnimatePresence mode="wait">
                {mcqFeedback === "correct" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-[#fff5f0] border border-[#ff5700]/20"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ff5700]/30 bg-white">
                      <Image
                        src="/images/character.png"
                        alt=""
                        width={40}
                        height={40}
                        className="w-full h-auto object-contain"
                      />
                    </span>
                    <p className="font-bold text-[#212529]">
                      정답이에요! 똑똑해!
                    </p>
                  </motion.div>
                )}
                {mcqFeedback === "wrong" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-200 bg-white">
                      <Image
                        src="/images/character.png"
                        alt=""
                        width={40}
                        height={40}
                        className="w-full h-auto object-contain opacity-80"
                      />
                    </span>
                    <p className="font-medium text-amber-800">
                      아쉬워요, 다시 한번 읽어볼까요?
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {mcqFeedback !== null && (
                <button
                  type="button"
                  onClick={handleMcqNext}
                  className="mt-4 rounded-xl px-4 py-2 font-bold text-white bg-[#ff5700]"
                >
                  {mcqIndex + 1 < readQuizzes.length ? "다음 문제" : "퀴즈 완료"}
                </button>
              )}
            </div>
          )}
          {mcqDone && (
            <p className="font-bold text-[#212529]">
              퀴즈를 모두 풀었어요. 수고했어요!
            </p>
          )}
        </div>
      )}
    </section>
  );
}
