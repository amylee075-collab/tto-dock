import { categoryStories } from "@/lib/data";
import { getContentsByTypeFromSupabase } from "@/lib/content-from-supabase";
import StoryCard from "@/components/reading/StoryCard";

/** 3단 컬럼 순서: 과학, 사회, 역사 */
const SECTION_ORDER: readonly ("과학" | "역사" | "사회")[] = [
  "과학",
  "사회",
  "역사",
];

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "분야별 글 읽기 | 또독",
  description: "과학, 역사, 사회 등 다양한 주제의 글을 읽어 보세요.",
};

export default async function CategoryListPage() {
  const fromSupabase = await getContentsByTypeFromSupabase("category");
  const localIds = new Set(categoryStories.map((s) => s.id));
  const onlyFromSupabase = fromSupabase.filter((s) => !localIds.has(s.id));
  const merged = onlyFromSupabase.length ? [...onlyFromSupabase, ...categoryStories] : categoryStories;

  const sectionsWithExtra = [
    ...SECTION_ORDER.map((section) => ({
      section,
      stories: merged.filter((s) => s.section === section),
    })),
    { section: "추가" as const, stories: merged.filter((s) => !s.section) },
  ].filter((s) => s.stories.length > 0);

  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-8">
        분야별 글 읽기
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {sectionsWithExtra.map(({ section, stories }) => (
          <section
            key={section}
            className="min-w-0 flex flex-col rounded-2xl bg-gray-50 shadow-sm p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-[#212529] mb-6">
              {section}
            </h2>
            <ul className="flex flex-col gap-6">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  href={`/reading/category/${story.id}`}
                  thumbnail={story.thumbnail}
                  title={story.title}
                  badges={story.badges}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
