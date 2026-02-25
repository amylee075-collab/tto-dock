"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pickRandomTodayWord, type TodayWordItem, type WordType } from "@/lib/todayWordList";

const BADGE_STYLE: Record<WordType, string> = {
  순우리말: "bg-lime-200 text-lime-900",
  한자어: "bg-blue-200 text-blue-900",
  외래어: "bg-violet-200 text-violet-900",
};

export default function HeroWordQuiz() {
  const [word, setWord] = useState<TodayWordItem | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setWord(pickRandomTodayWord());
  }, []);

  if (!word) {
    return (
      <section
        id="hero"
        className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg mb-10"
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
      className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg mb-10"
      aria-label="오늘의 단어"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex-1">
          <h2 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-4">
            오늘의 단어
          </h2>
          <div className="rounded-2xl bg-[#fff5f0] border border-[#ff5700]/10 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#ff5700]">
                {word.word}
              </p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${BADGE_STYLE[word.type]}`}
              >
                {word.type}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-[#ff5700] font-bold text-base hover:underline mb-1"
            >
              {expanded ? "뜻 접기" : "뜻 보기"}
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-xl sm:text-2xl text-[#212529] font-medium mb-3 leading-relaxed pt-1">
                    {word.meaning}
                  </p>
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                    {word.example}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="shrink-0 flex justify-center sm:justify-end min-w-0">
          <motion.span
            className="flex w-28 h-28 sm:w-36 sm:h-36 items-center justify-center overflow-hidden rounded-full bg-[#fff5f0]"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {!avatarError ? (
              <Image
                src="/images/character.png"
                alt="똑똑이"
                width={144}
                height={144}
                className="w-full h-auto object-contain object-top"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-5xl" aria-hidden>
                🦊
              </span>
            )}
          </motion.span>
        </div>
      </div>
    </section>
  );
}
