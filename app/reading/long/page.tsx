import { getContentsByTypeFromSupabase } from "@/lib/content-from-supabase";
import StoryCard from "@/components/reading/StoryCard";

// Cache kill: always fetch latest admin edits
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TITLE = "긴 글 읽기 | 또독";
const DESC =
  "긴 글을 읽고 어휘를 익힌 뒤 퀴즈를 풀어 보세요.";
const H1 = "긴 글 읽기";

export const metadata = {
  title: TITLE,
  description: DESC,
};

export default async function LongReadingListPage() {
  const raw = await getContentsByTypeFromSupabase("long");
  const stories = Array.isArray(raw) ? raw : [];

  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2">{H1}</h1>
      <p className="text-gray-600 mb-8">{DESC}</p>
      {stories.length === 0 ? (
        <p className="text-gray-500 py-6" role="status">
          준비된 글이 없습니다. 어드민에서 새 글을 추가해 주세요.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              href={`/reading/long/${story.id}`}
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

