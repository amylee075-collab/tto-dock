import { digitalLiteracy } from "@/lib/data";
import StoryCard from "@/components/reading/StoryCard";

export const metadata = {
  title: "디지털 문해력 | 또독",
  description: "신문 기사와 미디어 비판 글을 읽고 퀴즈를 풀어 보세요.",
};

export default function DigitalListPage() {
  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2">
        디지털 문해력
      </h1>
      <p className="text-gray-600 mb-8">
        신문 기사와 미디어 비판 글을 읽고 어휘를 익힌 뒤 퀴즈를 풀어 보세요.
      </p>
      <ul className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {digitalLiteracy.map((story) => (
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
