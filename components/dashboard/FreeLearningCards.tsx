"use client";

import { useRouter } from "next/navigation";
import { getRandomPassageByCategory, getRandomNewsPassage } from "@/lib/data";

export default function FreeLearningCards() {
  const router = useRouter();

  const handleCategory = (category: "science" | "history" | "society") => {
    const passage = getRandomPassageByCategory(category);
    router.push(`/reading/${passage.id}`);
  };

  const handleNews = () => {
    const passage = getRandomNewsPassage();
    router.push(`/reading/${passage.id}`);
  };

  return (
    <section id="free-learning" className="scroll-mt-24">
      <h2 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-6 pb-3 border-b border-gray-100">
        자유 학습
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full">
        <li className="min-w-0">
          <button
            type="button"
            onClick={() => {
              const categories = ["science", "history", "society"] as const;
              const category =
                categories[Math.floor(Math.random() * categories.length)];
              handleCategory(category);
            }}
            className="w-full flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px] rounded-2xl border border-gray-200 bg-white p-8 hover:border-[#FF5C00]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/30 text-left"
          >
            <span
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-[#fff5f0] text-3xl sm:text-4xl mb-4"
              aria-hidden
            >
              🧩
            </span>
            <span className="font-extrabold text-xl sm:text-2xl text-[#212529] text-center">
              분야별 글 읽기
            </span>
            <span className="text-base text-gray-500 font-medium mt-2 text-center">
              과학 / 역사 / 사회 랜덤
            </span>
          </button>
        </li>
        <li className="min-w-0">
          <button
            type="button"
            onClick={handleNews}
            className="w-full flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px] rounded-2xl border border-gray-200 bg-white p-8 hover:border-[#FF5C00]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/30 text-left"
          >
            <span
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-[#fff5f0] text-3xl sm:text-4xl mb-4"
              aria-hidden
            >
              📰
            </span>
            <span className="font-extrabold text-xl sm:text-2xl text-[#212529] text-center">
              디지털 문해력
            </span>
            <span className="text-base text-gray-500 font-medium mt-2 text-center">
              뉴스 기사
            </span>
          </button>
        </li>
      </ul>
    </section>
  );
}
