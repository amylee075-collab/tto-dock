import { longStories } from "@/lib/data";
import StoryCard from "@/components/reading/StoryCard";

export default function LongReadingListPage() {
  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2">
        긴 글 읽기
      </h1>
      <p className="text-gray-600 mb-8">
        긴 명작을 읽고 어휘를 익힌 뒤 퀴즈를 풀어 보세요.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {longStories.map((story) => (
          <StoryCard
            key={story.id}
            href={`/reading/long/${story.id}`}
            thumbnail={story.thumbnail}
            title={story.title}
            badges={story.badges?.length ? story.badges : ["긴 글"]}
          />
        ))}
      </ul>
    </div>
  );
}
