"use client";

import type { AchievementBadge } from "@/lib/mypage-data";

interface AchievementBadgesProps {
  badges: AchievementBadge[];
}

export default function AchievementBadges({ badges }: AchievementBadgesProps) {
  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm mb-10 overflow-hidden">
      <h3 className="font-extrabold text-xl text-[#212529] mb-6">
        성취 배지
      </h3>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {badges.map((badge) => (
          <li
            key={badge.id}
            className={`min-w-0 flex flex-col items-center text-center rounded-2xl border-2 p-5 md:p-6 transition-all ${
              badge.unlocked
                ? "border-ttodock-orange bg-soft-orange shadow-sm"
                : "border-gray-200 bg-gray-50 grayscale opacity-90"
            }`}
          >
            <span
              className={`text-4xl md:text-5xl mb-3 block ${!badge.unlocked ? "opacity-70" : ""}`}
              aria-hidden
            >
              {badge.icon}
            </span>
            <p
              className={`font-bold text-base md:text-lg mb-1 ${
                badge.unlocked ? "text-[#212529]" : "text-gray-500"
              }`}
            >
              {badge.title}
            </p>
            <p
              className={`text-xs md:text-sm leading-snug ${
                badge.unlocked ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {badge.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
