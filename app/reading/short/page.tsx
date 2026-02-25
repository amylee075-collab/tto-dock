import Link from "next/link";
import { shortStories } from "@/lib/data";
import ThumbnailWithFallback from "@/components/reading/ThumbnailWithFallback";

function getShortDescription(content: string, maxLen = 80) {
  const trimmed = content.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen) + "…";
}

export default function ShortReadingListPage() {
  return (
    <div className="w-full max-w-7xl">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2">
        짧은 글 읽기
      </h1>
      <p className="text-gray-600 mb-8">
        명작과 고전을 읽고 어휘를 익힌 뒤 퀴즈를 풀어 보세요.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {shortStories.map((story, index) => (
          <li
            key={story.id}
            className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden min-w-0 w-full"
          >
            <div className="aspect-video relative w-full overflow-hidden bg-gray-100">
              <ThumbnailWithFallback
                src={story.thumbnail}
                alt=""
                priority={index < 3}
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
              <h2 className="font-bold text-lg text-[#212529] mb-2">
                {story.title}
              </h2>
              <p className="text-sm text-gray-600 flex-1 line-clamp-3 mb-4 min-w-0">
                {getShortDescription(story.content)}
              </p>
              <Link
                href={`/reading/short/${story.id}`}
                className="inline-flex justify-center items-center rounded-xl px-5 py-3 font-bold text-white shadow-sm hover:opacity-90 transition-opacity bg-[#ff5700]"
              >
                학습 시작
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
