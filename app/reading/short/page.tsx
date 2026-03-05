import { shortStories } from "@/lib/data";
import { getContentsByTypeFromSupabase } from "@/lib/content-from-supabase";
import StoryCard from "@/components/reading/StoryCard";

export default async function ShortReadingListPage() {
  const fromSupabase = await getContentsByTypeFromSupabase("short");
  const localIds = new Set(shortStories.map((s) => s.id));
  const onlyFromSupabase = fromSupabase.filter((s) => !localIds.has(s.id));
  const ordered = onlyFromSupabase.length ? [...onlyFromSupabase, ...shortStories] : shortStories;

  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2">
        짧은 글 읽기
      </h1>
      <p className="text-gray-600 mb-8">
        명작과 고전을 읽고 어휘를 익힌 뒤 퀴즈를 풀어 보세요.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {ordered.map((story, index) => (
          <StoryCard
            key={story.id}
            href={`/reading/short/${story.id}`}
            thumbnail={story.thumbnail}
            title={story.title}
            badges={story.badges?.length ? story.badges : ["짧은 글"]}
          />
        ))}
      </ul>
    </div>
  );
}
