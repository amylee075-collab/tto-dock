"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pickRandomTodayWord, type TodayWordItem, type WordType } from "@/lib/todayWordList";

/** 예문 문자열에서 해당 단어를 강조한 React 노드 배열 반환 (bold + 주황색) */
function emphasizeWordInExample(example: string, word: string): React.ReactNode {
  if (!word.trim()) return example;
  const parts = example.split(word);
  if (parts.length <= 1) return example;
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    nodes.push(part);
    if (i < parts.length - 1) {
      nodes.push(
        <span key={`w-${i}`} className="font-bold text-[#ff5700]">
          {word}
        </span>
      );
    }
  });
  return nodes;
}

const BADGE_STYLE: Record<WordType, string> = {
  순우리말: "bg-lime-200 text-lime-900",
  한자어: "bg-blue-200 text-blue-900",
  외래어: "bg-violet-200 text-violet-900",
};

type Props = {
  wordList?: TodayWordItem[];
  className?: string;
  variant?: "standalone" | "inline";
};

export default function HeroWordQuiz({
  wordList,
  className = "",
  variant = "standalone",
}: Props) {
  const [word, setWord] = useState<TodayWordItem | null>(null);
  const [activeTab, setActiveTab] = useState<"meaning" | "example">("meaning");

  useEffect(() => {
    if (wordList && wordList.length > 0) {
      const index = Math.floor(Math.random() * wordList.length);
      setWord(wordList[index]);
    } else {
      setWord(pickRandomTodayWord());
    }
  }, [wordList]);

  const isInline = variant === "inline";

  if (!word) {
    return (
      <section
        id="hero"
        className={`${
          isInline
            ? "h-full min-h-[220px]"
            : "rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 h-full min-h-[320px]"
        } ${className}`}
        aria-label="오늘의 단어"
      >
        <div className="h-32 flex items-center justify-center text-gray-400">
          로딩 중…
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className={`${
        isInline
          ? "h-full min-h-[220px] flex flex-col"
          : "rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 h-full min-h-[320px] flex flex-col"
      } ${className}`}
      aria-label="오늘의 단어"
    >
      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-4">
          오늘의 단어
        </h2>
        <div className="rounded-2xl bg-[#fff5f0] border border-[#ff5700]/10 p-5 sm:p-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#ff5700]">
              {word.word}
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${BADGE_STYLE[word.type]}`}
            >
              {word.type}
            </span>
          </div>

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setActiveTab("meaning")}
              className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-bold transition-colors
                  ${activeTab === "meaning" ? "bg-[#ff5700] text-white shadow-sm" : "bg-white text-[#ff5700] border border-[#ff5700]/30 hover:bg-[#fff0e6]"}
                `}
            >
              뜻
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("example")}
              className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-bold transition-colors
                  ${activeTab === "example" ? "bg-[#ff5700] text-white shadow-sm" : "bg-white text-[#ff5700] border border-[#ff5700]/30 hover:bg-[#fff0e6]"}
                `}
            >
              예문
            </button>
          </div>
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-h-[2.5rem]"
            >
              {activeTab === "meaning" ? (
                <p className="text-lg sm:text-xl text-[#212529] font-medium leading-relaxed">
                  {word.meaning}
                </p>
              ) : (
                <p className="text-lg sm:text-xl text-[#212529] font-medium leading-relaxed">
                  {emphasizeWordInExample(word.example, word.word)}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
