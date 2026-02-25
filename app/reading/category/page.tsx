import Link from "next/link";
import { categoryStories } from "@/lib/data";
import ThumbnailWithFallback from "@/components/reading/ThumbnailWithFallback";

/** 3단 컬럼 순서: 과학, 사회, 역사 */
const SECTION_ORDER: readonly ("과학" | "역사" | "사회")[] = [
  "과학",
  "사회",
  "역사",
];

export const metadata = {
  title: "분야별 글 읽기 | 또독",
  description: "과학, 역사, 사회 등 다양한 주제의 글을 읽어 보세요.",
};

export default function CategoryListPage() {
  const sections = SECTION_ORDER.map((section) => ({
    section,
    stories: categoryStories.filter((s) => s.section === section),
  }));

  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-8">
        분야별 글 읽기
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {sections.map(({ section, stories }) => (
          <section
            key={section}
            className="min-w-0 flex flex-col rounded-2xl bg-gray-50 shadow-sm p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-[#212529] mb-6">
              {section}
            </h2>
            <ul className="flex flex-col gap-6">
              {stories.map((story) => (
                <li
                  key={story.id}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden min-w-0 w-full"
                >
                  <div className="aspect-video relative w-full overflow-hidden bg-gray-100 shrink-0">
                    <ThumbnailWithFallback
                      src={story.thumbnail}
                      alt=""
                      sizes="(max-width:1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {story.badges?.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full bg-[#fff5f0] px-3 py-1.5 text-base font-bold text-[#ff5700]"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-2xl text-[#212529] leading-tight mb-5 line-clamp-2">
                      {story.title}
                    </h3>
                    <Link
                      href={`/reading/category/${story.id}`}
                      className="mt-auto inline-flex justify-center items-center rounded-lg px-5 py-3 text-base font-bold text-white shadow-sm hover:opacity-90 transition-opacity bg-[#ff5700]"
                    >
                      학습 시작
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
