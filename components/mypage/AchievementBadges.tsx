"use client";

import type { AchievementBadge } from "@/lib/mypage-data";

interface AchievementBadgesProps {
  badges: AchievementBadge[];
}

export default function AchievementBadges({ badges }: AchievementBadgesProps) {
  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8 overflow-hidden">
      <h3 className="font-extrabold text-lg text-[#212529] mb-4">
        성취 배지
      </h3>
      <ul className="flex flex-wrap gap-3">
        {badges.map((badge) => (
          <li
            key={badge.id}
            className={`min-w-0 flex items-center gap-2 rounded-xl border-2 px-4 py-3 ${
              badge.unlocked
                ? "border-ttodock-orange bg-soft-orange"
                : "border-gray-200 bg-gray-50 opacity-60"
            }`}
          >
            <span className="text-xl" aria-hidden>
              {badge.icon}
            </span>
            <div>
              <p className="font-bold text-sm text-[#212529]">{badge.title}</p>
              <p className="text-xs text-gray-600">{badge.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
