"use client";

import { useMemo, useState } from "react";
import StoryCard from "@/components/reading/StoryCard";
import { normalizeDifficultyToLevel } from "@/lib/difficulty-stars";
import type { ShortStory } from "@/lib/data";

type CategoryFilter = "전체" | "과학" | "역사" | "사회" | "예술" | "기술·AI";
type SortOption = "title" | "difficulty";

const FILTERS: CategoryFilter[] = ["전체", "과학", "역사", "사회", "예술", "기술·AI"];

interface CategoryListClientProps {
  stories: ShortStory[];
}

function hasFilterTag(story: ShortStory, filter: Exclude<CategoryFilter, "전체">): boolean {
  if (story.section === filter) return true;
  if (!Array.isArray(story.badges)) return false;
  return story.badges.some((badge) => String(badge).trim() === filter);
}

function sortStories(stories: ShortStory[], sortBy: SortOption): ShortStory[] {
  const copied = [...stories];
  if (sortBy === "difficulty") {
    return copied.sort((a, b) => {
      const levelA = normalizeDifficultyToLevel(a.difficulty) ?? 99;
      const levelB = normalizeDifficultyToLevel(b.difficulty) ?? 99;
      if (levelA !== levelB) return levelA - levelB;
      return a.title.localeCompare(b.title, "ko");
    });
  }
  return copied.sort((a, b) => a.title.localeCompare(b.title, "ko"));
}

export default function CategoryListClient({ stories }: CategoryListClientProps) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("전체");
  const [sortBy, setSortBy] = useState<SortOption>("title");

  const counts = useMemo(() => {
    return FILTERS.reduce<Record<CategoryFilter, number>>((acc, filter) => {
      acc[filter] =
        filter === "전체"
          ? stories.length
          : stories.filter((story) => hasFilterTag(story, filter)).length;
      return acc;
    }, { 전체: 0, 과학: 0, 역사: 0, 사회: 0, 예술: 0, "기술·AI": 0 });
  }, [stories]);

  const filteredStories = useMemo(() => {
    const base =
      activeFilter === "전체"
        ? stories
        : stories.filter((story) => hasFilterTag(story, activeFilter));
    return sortStories(base, sortBy);
  }, [activeFilter, sortBy, stories]);

  return (
    <div className="w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-[#212529]">분야별 글 읽기</h1>
          <p className="mt-2 text-sm text-gray-500">
            원하는 주제를 칩으로 골라보고, 제목 또는 난이도 기준으로 정렬해 보세요.
          </p>
        </div>

        <label className="flex items-center gap-3 self-start lg:self-auto">
          <span className="text-sm font-semibold text-gray-600">정렬</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#212529] shadow-sm outline-none transition focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FFEDD5]"
            aria-label="분야별 글 정렬"
          >
            <option value="title">제목 가나다순</option>
            <option value="difficulty">난이도순</option>
          </select>
        </label>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-[#FF5C00] bg-[#FFF1E8] text-[#FF5C00]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#FFD0B2] hover:text-[#FF5C00]"
              }`}
              aria-pressed={isActive}
            >
              {filter} ({counts[filter]})
            </button>
          );
        })}
      </div>

      {filteredStories.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-gray-500">
            선택한 필터에 해당하는 콘텐츠가 아직 없어요.
          </p>
        </section>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              href={`/reading/category/${story.id}`}
              thumbnail={story.thumbnail}
              title={story.title}
              section={story.section}
              badges={story.badges ?? []}
              difficulty={story.difficulty}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
