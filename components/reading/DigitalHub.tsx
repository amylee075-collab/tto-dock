"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getRandomNewsPassage } from "@/lib/data";

export default function DigitalHub() {
  const router = useRouter();

  const handleStart = () => {
    const passage = getRandomNewsPassage();
    router.push(`/reading/${passage.id}`);
  };

  return (
    <div className="py-8 sm:py-10 w-full max-w-2xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="font-extrabold text-2xl sm:text-3xl text-[#212529] tracking-tight mb-2">
          디지털 문해력
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          뉴스 기사를 읽으며 똑똑한 미디어 사용법을 배워요.
        </p>
      </header>

      <motion.button
        type="button"
        onClick={handleStart}
        className="w-full flex flex-col items-center rounded-[20px] border border-gray-100 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-shadow duration-300 border-[#FF5C00]/20 hover:border-[#FF5C00]/40 focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/50"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff5f0] text-4xl mb-4">
          📰
        </span>
        <h2 className="font-bold text-xl sm:text-2xl text-[#212529] mb-2">
          뉴스 기사 읽기
        </h2>
        <p className="text-gray-600 text-base mb-4">
          매일 다른 뉴스 기사가 준비되어 있어요. 클릭하면 바로 읽기를 시작해요!
        </p>
        <span className="inline-flex rounded-xl bg-[#FF5C00] px-6 py-3 font-bold text-white">
          읽기 시작하기
        </span>
      </motion.button>
    </div>
  );
}
