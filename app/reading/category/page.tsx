import { getContentsByTypeFromSupabase } from "@/lib/content-from-supabase";
import StoryCard from "@/components/reading/StoryCard";

/** 3단 컬럼 순서: 과학, 사회, 역사. 필터는 badges 배열에 분야 이름 포함 여부로 판단 */
const SECTION_ORDER: readonly ("과학" | "역사" | "사회")[] = [
  "과학",
  "사회",
  "역사",
];

function hasSectionInBadges(story: { badges?: string[] }, section: string): boolean {
  return Array.isArray(story.badges) && story.badges.some((tag) => String(tag).includes(section));
}

function inNoSection(story: { badges?: string[] }): boolean {
  return !SECTION_ORDER.some((sec) => hasSectionInBadges(story, sec));
}

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "분야별 글 읽기 | 또독",
  description: "과학, 역사, 사회 등 다양한 주제의 글을 읽어 보세요.",
};

export default async function CategoryListPage() {
  const fromSupabase = await getContentsByTypeFromSupabase("category");
  const merged = Array.isArray(fromSupabase) ? fromSupabase : [];

  const sectionsWithExtra = [
    ...SECTION_ORDER.map((section) => ({
      section,
      stories: merged.filter((s) => hasSectionInBadges(s, section)),
    })),
    { section: "추가" as const, stories: merged.filter(inNoSection) },
  ].filter((s) => s.stories.length > 0);

  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-8">
        분야별 글 읽기
      </h1>

      {!merged.length || sectionsWithExtra.length === 0 ? (
        <p className="text-gray-500 py-6" role="status">
          등록된 분야별 콘텐츠가 없습니다. 어드민에서 새로운 글을 추가해 주세요.
        </p>
      ) : (
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
                    section={story.section}
                    badges={story.badges ?? []}
                    difficulty={story.difficulty}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
