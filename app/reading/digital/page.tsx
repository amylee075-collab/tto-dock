import { getContentsByTypeFromSupabase } from "@/lib/content-from-supabase";
import StoryCard from "@/components/reading/StoryCard";

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "디지털 문해력 | 또독",
  description: "신문 기사와 미디어 비판 글을 읽고 퀴즈를 풀어 보세요.",
};

export default async function DigitalListPage() {
  const raw = await getContentsByTypeFromSupabase("digital");
  const ordered = Array.isArray(raw) ? raw : [];

  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2">
        디지털 문해력
      </h1>
      <p className="text-gray-600 mb-8">
        신문 기사와 미디어 비판 글을 읽고 어휘를 익힌 뒤 퀴즈를 풀어 보세요.
      </p>
      {ordered.length === 0 ? (
        <p className="text-gray-500 py-6" role="status">
          등록된 디지털 문해력 콘텐츠가 없습니다. 어드민에서 새로운 글을 추가해 주세요.
        </p>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {ordered.map((story) => (
            <StoryCard
              key={story.id}
              href={`/reading/digital/${story.id}`}
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
