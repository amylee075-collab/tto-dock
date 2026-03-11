"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FreeLearningCards() {
  const router = useRouter();
  const [loading, setLoading] = useState<"category" | "digital" | null>(null);

  const handleCategory = async () => {
    setLoading("category");
    try {
      const res = await fetch("/api/reading/random-id?type=category");
      const { id } = await res.json();
      if (id) router.push(`/reading/category/${id}`);
      else router.push("/reading/category");
    } finally {
      setLoading(null);
    }
  };

  const handleDigital = async () => {
    setLoading("digital");
    try {
      const res = await fetch("/api/reading/random-id?type=digital");
      const { id } = await res.json();
      if (id) router.push(`/reading/digital/${id}`);
      else router.push("/reading/digital");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="free-learning" className="scroll-mt-24">
      <h2 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-6 pb-3 border-b border-gray-100">
        읽기 탐색
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full">
        <li className="min-w-0">
          <button
            type="button"
            onClick={handleCategory}
            disabled={loading !== null}
            className="w-full flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px] rounded-2xl border border-gray-200 bg-white p-8 hover:border-[#ff5700]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5700]/30 text-left disabled:opacity-70"
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
              과학 / 역사 / 사회
            </span>
          </button>
        </li>
        <li className="min-w-0">
          <button
            type="button"
            onClick={handleDigital}
            disabled={loading !== null}
            className="w-full flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px] rounded-2xl border border-gray-200 bg-white p-8 hover:border-[#ff5700]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5700]/30 text-left disabled:opacity-70"
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
              신문·미디어 비판
            </span>
          </button>
        </li>
      </ul>
    </section>
  );
}
