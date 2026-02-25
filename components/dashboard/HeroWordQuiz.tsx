"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import type { DailyWordQuiz } from "@/lib/data";

interface HeroWordQuizProps {
  quiz: DailyWordQuiz;
}

export default function HeroWordQuiz({ quiz }: HeroWordQuizProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

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
            <p className="text-2xl sm:text-3xl font-extrabold text-[#ff5700] mb-3">
              {quiz.word}
            </p>
            {showAnswer ? (
              <>
                <p className="text-lg sm:text-xl text-[#212529] font-medium mb-3 leading-relaxed">
                  {quiz.meaning}
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {quiz.example}
                </p>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="text-[#ff5700] font-bold text-base hover:underline"
              >
                뜻 보기
              </button>
            )}
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
