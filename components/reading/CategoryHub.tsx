"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

const categories = [
  { key: "science", label: "과학", description: "과학 주제의 글을 읽어요.", icon: "🔬" },
  { key: "history", label: "역사", description: "역사 주제의 글을 읽어요.", icon: "📜" },
  { key: "society", label: "사회", description: "사회 주제의 글을 읽어요.", icon: "🏛️" },
] as const;

export default function CategoryHub() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCategory = async (category: "science" | "history" | "society") => {
    setLoading(category);
    try {
      const res = await fetch(`/api/reading/random-id?type=category&section=${category}`);
      const { id } = await res.json();
      if (id) router.push(`/reading/category/${id}`);
      else router.push("/reading/category");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-8 sm:py-10 w-full">
      <header className="text-center mb-10">
        <h1 className="font-extrabold text-2xl sm:text-3xl text-[#212529] tracking-tight mb-2">
          분야별 글 읽기
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          관심 있는 분야를 골라 읽기를 시작해 보세요.
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {categories.map((cat, i) => (
          <li key={cat.key}>
            <motion.button
              type="button"
              onClick={() => handleCategory(cat.key)}
              disabled={loading !== null}
              className="w-full text-left h-full flex flex-col rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-shadow duration-300 border-[#FF5C00]/20 hover:border-[#FF5C00]/40 focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/50 disabled:opacity-70"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff5f0] text-2xl mb-4">
                {cat.icon}
              </span>
              <h2 className="font-bold text-xl text-[#212529] mb-1">{cat.label}</h2>
              <p className="text-gray-600 text-base">{cat.description}</p>
            </motion.button>
          </li>
        ))}
      </ul>
    </div>
  );
}
