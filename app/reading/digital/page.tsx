import { digitalLiteracy } from "@/lib/data";
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
  const fromSupabase = await getContentsByTypeFromSupabase("digital");
  const localIds = new Set(digitalLiteracy.map((s) => s.id));
  const onlyFromSupabase = fromSupabase.filter((s) => !localIds.has(s.id));
  const ordered = onlyFromSupabase.length ? [...onlyFromSupabase, ...digitalLiteracy] : digitalLiteracy;

  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2">
        디지털 문해력
      </h1>
      <p className="text-gray-600 mb-8">
        신문 기사와 미디어 비판 글을 읽고 어휘를 익힌 뒤 퀴즈를 풀어 보세요.
      </p>
      <ul className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {ordered.map((story) => (
          <StoryCard
            key={story.id}
            href={`/reading/digital/${story.id}`}
            thumbnail={story.thumbnail}
            title={story.title}
            badges={story.badges}
          />
        ))}
      </ul>
    </div>
  );
}
