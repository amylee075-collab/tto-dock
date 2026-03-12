"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import StoryCard from "@/components/reading/StoryCard";
import type { ShortStory } from "@/lib/data";
import type { CategoryContentFilter, CategoryContentSort } from "@/lib/content-from-supabase";

const FILTERS: CategoryContentFilter[] = ["전체", "과학", "역사", "사회", "예술", "기술·AI"];

interface CategoryListClientProps {
  stories: ShortStory[];
  initialStories: ShortStory[];
}

function hasFilterTag(story: ShortStory, filter: Exclude<CategoryContentFilter, "전체">): boolean {
  if (story.section === filter) return true;
  if (!Array.isArray(story.badges)) return false;
  return story.badges.some((badge) => String(badge).trim() === filter);
}

function CategoryListSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <div className="aspect-video animate-pulse bg-gray-100" />
          <div className="space-y-4 p-6">
            <div className="flex gap-2">
              <div className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />
              <div className="h-7 w-12 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="h-7 w-3/4 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function CategoryListClient({
  stories,
  initialStories,
}: CategoryListClientProps) {
  const [activeFilter, setActiveFilter] = useState<CategoryContentFilter>("전체");
  const [sortBy, setSortBy] = useState<CategoryContentSort>("title");
  const [displayStories, setDisplayStories] = useState<ShortStory[]>(initialStories);
  const [isLoading, setIsLoading] = useState(false);
  const didMountRef = useRef(false);

  const counts = useMemo(() => {
    return FILTERS.reduce<Record<CategoryContentFilter, number>>((acc, filter) => {
      acc[filter] =
        filter === "전체"
          ? stories.length
          : stories.filter((story) => hasFilterTag(story, filter)).length;
      return acc;
    }, { 전체: 0, 과학: 0, 역사: 0, 사회: 0, 예술: 0, "기술·AI": 0 });
  }, [stories]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      setDisplayStories(initialStories);
      return;
    }

    let ignore = false;
    const controller = new AbortController();

    const loadStories = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          filter: activeFilter,
          sortBy,
        });
        const res = await fetch(`/api/reading/category?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("failed to fetch category stories");
        const data = (await res.json()) as { stories?: ShortStory[] };
        if (!ignore) {
          setDisplayStories(Array.isArray(data.stories) ? data.stories : []);
        }
      } catch (error) {
        if (!ignore && !(error instanceof DOMException && error.name === "AbortError")) {
          setDisplayStories([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadStories();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [activeFilter, initialStories, sortBy]);

  return (
    <div className="w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-[#212529]">분야별 글 읽기</h1>
          <p className="mt-2 text-sm text-gray-500">
            다양한 주제의 글을 읽으면서 문해력을 키워보아요.
          </p>
        </div>

        <label className="flex items-center gap-3 self-start lg:self-auto">
          <span className="text-sm font-semibold text-gray-600">정렬</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as CategoryContentSort)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#212529] shadow-sm outline-none transition focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FFEDD5]"
            aria-label="분야별 글 정렬"
          >
            <option value="title">제목순</option>
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

      {isLoading ? (
        <CategoryListSkeleton />
      ) : displayStories.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-gray-500">
            선택한 필터에 해당하는 콘텐츠가 아직 없어요.
          </p>
        </section>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayStories.map((story) => (
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
