"use client";

import Link from "next/link";
import ThumbnailWithFallback from "@/components/reading/ThumbnailWithFallback";
import {
  difficultyToStarsFromAny,
  normalizeDifficultyToLevel,
} from "@/lib/difficulty-stars";

interface StoryCardProps {
  href: string;
  thumbnail: string;
  title: string;
  /** 어드민 지정 분야 (과학, 역사, 사회 등) — 레거시 단일 값 */
  section?: string;
  /** Supabase 필드명 badges — 어드민에서 설정한 배열 그대로 칩으로 노출 */
  badges?: string[];
  /** 어드민 난이도 — 1|2|3 또는 '쉬움'|'보통'|'어려움' → 별표 칩으로 표시 */
  difficulty?: number | string;
}

/**
 * Supabase badges 배열·difficulty 참조. badges.map()으로 모든 칩 노출(유효 분야 최대 3개 + 레거시).
 */
export default function StoryCard({
  href,
  thumbnail,
  title,
  section,
  badges,
  difficulty,
}: StoryCardProps) {
  // Supabase badges: ["비문학","역사","★☆☆"] → 별표 포함은 주황 난이도 칩, 나머지는 파란 분야 칩
  const rawBadges = badges ?? [];
  const finalBadges =
    typeof rawBadges === "string" ? [rawBadges] : Array.isArray(rawBadges) ? rawBadges : [];
  const categoryChips = finalBadges
    .map((b) => String(b).trim())
    .filter((b) => b && !String(b).includes("★"));
  const difficultyBadge = finalBadges.find((b) => b && String(b).includes("★")) ?? null;

  const difficultyLevel =
    normalizeDifficultyToLevel(difficulty) ??
    (difficultyBadge ? normalizeDifficultyToLevel(difficultyBadge) : null) ??
    (() => {
      for (const b of finalBadges) {
        const level = normalizeDifficultyToLevel(String(b).trim());
        if (level != null) return level;
      }
      return null;
    })();
  const difficultyStars = difficultyToStarsFromAny(difficultyLevel);
  const orangeChipText = difficultyStars || difficultyBadge || "";
  const showDifficultyChip = orangeChipText.length > 0;

  return (
    <li className="flex flex-col rounded-xl border border-gray-200 bg-white min-w-0 w-full">
      <div className="aspect-video relative w-full overflow-hidden rounded-t-xl bg-gray-100 shrink-0">
        <ThumbnailWithFallback
          src={thumbnail}
          alt=""
          sizes="(max-width:1024px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0 overflow-visible">
        <div className="flex flex-wrap items-center gap-2 mb-3 min-h-0 overflow-visible">
          {categoryChips.map((badge, i) => (
            <span
              key={`badge-${i}-${badge}`}
              className="rounded-full bg-blue-100 text-blue-800 px-3 py-1.5 text-sm font-medium shrink-0"
            >
              {badge}
            </span>
          ))}
          {showDifficultyChip && (
            <span
              className="font-sans rounded-full bg-orange-100 px-3 py-1.5 text-sm font-medium tabular-nums shrink-0"
              style={{ color: "#F97316" }}
              title={difficultyLevel != null ? `난이도 ${difficultyLevel}` : undefined}
            >
              {orangeChipText}
            </span>
          )}
        </div>
        <h3 className="font-bold text-2xl text-[#212529] leading-tight mb-5 line-clamp-2">
          {title || "제목 없음"}
        </h3>
        <Link
          href={href}
          className="mt-auto inline-flex justify-center items-center rounded-lg px-5 py-3 text-base font-bold text-white shadow-sm hover:opacity-90 transition-opacity bg-[#ff5700]"
        >
          학습 시작
        </Link>
      </div>
    </li>
  );
}
