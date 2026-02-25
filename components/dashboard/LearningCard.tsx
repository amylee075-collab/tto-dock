"use client";

import Link from "next/link";
import type { ReadingPassage } from "@/lib/data";

interface LearningCardProps {
  passage: ReadingPassage;
}

function getDifficultyLabel(difficulty: string): string {
  return difficulty === "easy" ? "쉬움" : "보통";
}

function getEstimatedMinutes(passage: ReadingPassage): number {
  return Math.max(5, Math.ceil(passage.sentences.length * 1.2));
}

export default function LearningCard({ passage }: LearningCardProps) {
  const difficultyLabel = getDifficultyLabel(passage.difficulty);
  const minutes = getEstimatedMinutes(passage);

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col">
      <h3 className="font-extrabold text-lg text-[#212529] mb-1">
        {passage.title}
      </h3>
      <p className="text-sm text-gray-600 font-medium flex-1 line-clamp-2">
        {passage.summary}
      </p>
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          {difficultyLabel}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          약 {minutes}분
        </span>
      </div>
      <Link
        href={`/reading/${passage.id}`}
        className="group mt-4 inline-flex items-center gap-1 text-ttodock-orange font-bold text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ttodock-orange/40 rounded"
      >
        학습 시작하기
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </article>
  );
}
