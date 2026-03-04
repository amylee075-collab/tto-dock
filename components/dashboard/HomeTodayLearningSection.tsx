"use client";

import Link from "next/link";
import type { TodayWordItem } from "@/lib/todayWordList";
import type { RecommendedReading } from "@/lib/data";

interface HomeTodayLearningSectionProps {
  wordList: TodayWordItem[];
  todaySeed: string;
  recommended: RecommendedReading;
}

export default function HomeTodayLearningSection({
  wordList: _wordList,
  todaySeed: _todaySeed,
  recommended,
}: HomeTodayLearningSectionProps) {
  return (
    <section
      id="today-learning"
      className="scroll-mt-24 w-full"
      aria-labelledby="today-learning-title"
    >
      <h2
        id="today-learning-title"
        className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-6"
      >
        오늘의 학습
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full">
        <li className="min-w-0">
          <Link
            href="/practice/core-word"
            className="block w-full h-full min-h-[220px] flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-0 hover:border-[#ff5700]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5700]/30"
          >
            <span
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-[#fff5f0] text-3xl sm:text-4xl mb-4"
              aria-hidden
            >
              📋
            </span>
            <span className="font-extrabold text-xl sm:text-2xl text-[#212529] text-center">
              문해력 기초 훈련
            </span>
            <span className="text-base text-gray-500 font-medium mt-2 text-center">
              핵심 단어 찾기
            </span>
          </Link>
        </li>
        <li className="min-w-0">
          <Link
            href={recommended.href}
            className="block w-full h-full min-h-[220px] flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-0 hover:border-[#ff5700]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5700]/30"
          >
            <span
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-[#fff5f0] text-3xl sm:text-4xl mb-4"
              aria-hidden
            >
              {recommended.type === "long" ? "📚" : recommended.type === "category" ? "🧩" : "📰"}
            </span>
            <span className="font-extrabold text-xl sm:text-2xl text-[#212529] text-center">
              추천 글 읽기
            </span>
            <span className="text-base text-gray-500 font-medium mt-2 text-center">
              매일 글 읽기로 문해력 키우기
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
