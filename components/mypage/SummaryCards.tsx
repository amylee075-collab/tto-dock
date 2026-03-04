"use client";

import { getCPMTier } from "@/lib/hooks/useCPM";
import type { CPMTier } from "@/lib/hooks/useCPM";

interface SummaryCardsProps {
  averageWpm: number;
  todayAccuracy: number;
  totalSentencesRead: number;
}

const tierBadgeStyle: Record<CPMTier, string> = {
  차근차근: "bg-blue-100 text-blue-800",
  안정적: "bg-soft-orange text-ttodock-orange",
  빠름: "bg-amber-50 text-amber-700",
  "매우 빠름": "bg-red-50 text-red-700",
};

type CardKey = "sentences" | "accuracy" | "speed";

export default function SummaryCards({
  averageWpm,
  todayAccuracy,
  totalSentencesRead,
}: SummaryCardsProps) {
  const { tier: readingTier, label: tierLabel } = getCPMTier(averageWpm);

  const cards: { key: CardKey; label: string; value: string }[] = [
    { key: "sentences", label: "읽은 문장 수", value: `${totalSentencesRead}문장` },
    { key: "accuracy", label: "퀴즈 정답률", value: `${todayAccuracy}%` },
    { key: "speed", label: "평균 속도", value: `${averageWpm} 글자 / 분` },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {cards.map(({ key, label, value }) => (
        <div
          key={key}
          className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-left overflow-hidden outline-none ring-0 cursor-default"
        >
          <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
          <p className="font-extrabold text-2xl text-[#212529]">{value}</p>
          {key === "speed" && averageWpm > 0 && (
            <span
              className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${tierBadgeStyle[readingTier]}`}
            >
              {tierLabel}
            </span>
          )}
        </div>
      ))}
    </section>
  );
}
