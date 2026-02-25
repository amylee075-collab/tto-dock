"use client";

import { useState } from "react";
import { getWPMTier } from "@/lib/hooks/useWPM";
import type { WPMTier } from "@/lib/hooks/useWPM";

interface SummaryCardsProps {
  averageWpm: number;
  todayAccuracy: number;
  totalSentencesRead: number;
}

const tierBadgeStyle: Record<WPMTier, string> = {
  느림: "bg-blue-100 text-blue-800",
  보통: "bg-soft-orange text-ttodock-orange",
  빠름: "bg-red-50 text-red-700",
};

type CardKey = "sentences" | "accuracy" | "speed";

export default function SummaryCards({
  averageWpm,
  todayAccuracy,
  totalSentencesRead,
}: SummaryCardsProps) {
  const [selected, setSelected] = useState<CardKey>("sentences");
  const readingTier = getWPMTier(averageWpm);

  const cards: { key: CardKey; label: string; value: string }[] = [
    { key: "sentences", label: "읽은 문장 수", value: `${totalSentencesRead}문장` },
    { key: "accuracy", label: "퀴즈 정답률", value: `${todayAccuracy}%` },
    { key: "speed", label: "평균 속도", value: `${averageWpm} WPM` },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {cards.map(({ key, label, value }) => (
        <button
          key={key}
          type="button"
          onClick={() => setSelected(key)}
          className={`w-full min-w-0 rounded-2xl border bg-white p-5 shadow-sm text-left transition-colors overflow-hidden ${
            selected === key
              ? "border-ttodock-orange border-2 ring-2 ring-ttodock-orange/20"
              : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
          <p className="font-extrabold text-2xl text-[#212529]">{value}</p>
          {key === "speed" && averageWpm > 0 && (
            <span
              className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${tierBadgeStyle[readingTier]}`}
            >
              {readingTier}
            </span>
          )}
        </button>
      ))}
    </section>
  );
}
