"use client";

import { useState, useCallback } from "react";
import type { TodayWordItem } from "@/lib/todayWordList";

type Props = {
  wordList: TodayWordItem[];
  todaySeed: string;
  className?: string;
  variant?: "standalone" | "inline";
};

const FIXED_SENTENCE_PREFIX = "실험이 끝난 후,";
const FIXED_SENTENCE_SUFFIX = "결과를 빠짐없이 기록하다.";
const FIXED_CHOICES = ["판단", "습관", "관찰"] as const;
const FIXED_ANSWER = "관찰";
const TOTAL_QUESTIONS = 5;

export default function TodayWordQuizCard({
  wordList: _wordList,
  todaySeed: _todaySeed,
  className = "",
  variant = "standalone",
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [results, setResults] = useState<(boolean | null)[]>(() => Array(TOTAL_QUESTIONS).fill(null));
  const isInline = variant === "inline";

  const handleSelect = useCallback(
    (word: string) => {
      if (answered !== null) return;
      setSelectedWord(word);
      const correct = word === FIXED_ANSWER;
      setAnswered(correct);
      setResults((prev) => {
        const next = [...prev];
        next[currentIndex] = correct;
        return next;
      });
    },
    [answered, currentIndex]
  );

  const goNext = useCallback(() => {
    setAnswered(null);
    setSelectedWord(null);
    setCurrentIndex((idx) => (idx < TOTAL_QUESTIONS - 1 ? idx + 1 : idx));
  }, []);

  return (
    <section
      className={`${
        isInline
          ? "h-full min-h-[220px] flex flex-col"
          : "rounded-2xl border border-gray-200 bg-white p-6 sm:p-6 flex flex-col h-full min-h-[320px]"
      } ${className}`}
      aria-label="단어 퀴즈"
    >
      <h2 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-4">
        또독 단어 퀴즈
      </h2>

      <div className="flex-1 flex flex-col min-h-0 rounded-xl bg-white p-4 sm:p-5">
        <div className="mb-6">
          <p className="text-base sm:text-lg text-[#212529] font-medium leading-relaxed">
            {FIXED_SENTENCE_PREFIX}{" "}
            <span
              className="inline-flex h-6 w-16 items-center justify-center rounded-lg bg-lime-200 text-white font-bold text-lg align-middle"
              aria-hidden
            >
              ?
            </span>{" "}
            {FIXED_SENTENCE_SUFFIX}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          {FIXED_CHOICES.map((word) => {
            const isSelected = selectedWord === word;
            const correct = word === FIXED_ANSWER;
            const showResult = answered !== null;
            const isCorrectChoice = showResult && isSelected && correct;
            const isWrongChoice = showResult && isSelected && !correct;
            const isUnselectedCorrect = showResult && correct && !isSelected;

            return (
              <button
                key={word}
                type="button"
                disabled={answered !== null}
                onClick={() => handleSelect(word)}
                className={`flex-1 rounded-xl px-4 py-3.5 text-left font-semibold transition-colors disabled:pointer-events-none flex items-center gap-3 min-h-[52px] border-2
                  ${!showResult
                    ? "bg-gray-50 border-gray-200 text-[#212529] hover:border-[#ff5700]/30 hover:bg-[#fffaf8]"
                    : ""}
                  ${isCorrectChoice
                    ? "bg-[#374151] border-[#374151] text-white"
                    : ""}
                  ${isWrongChoice
                    ? "bg-red-50 border-red-300 text-red-800"
                    : ""}
                  ${isUnselectedCorrect
                    ? "bg-gray-50 border-gray-200 text-gray-600"
                    : ""}
                  ${showResult && !correct && !isSelected
                    ? "bg-gray-50 border-gray-200 text-gray-600"
                    : ""}
                `}
              >
                <span
                  className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold
                    ${!showResult ? "bg-gray-200 text-gray-500" : ""}
                    ${isCorrectChoice ? "bg-white/30 text-white" : ""}
                    ${isWrongChoice ? "bg-red-200 text-red-700" : ""}
                    ${(isUnselectedCorrect || (showResult && !correct && !isSelected)) ? "bg-gray-200 text-gray-500" : ""}
                  `}
                  aria-hidden
                >
                  {showResult && isSelected ? (correct ? "✓" : "✗") : "✓"}
                </span>
                <span>{word}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 min-h-[40px] flex items-center justify-center">
          {answered !== null && currentIndex < TOTAL_QUESTIONS - 1 && (
            <button
              type="button"
              onClick={goNext}
              className="shrink-0 rounded-full bg-gray-200 text-[#212529] px-4 py-2 text-sm font-medium hover:bg-gray-300 transition-colors min-w-[100px] max-w-[140px]"
            >
              다음 퀴즈
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
