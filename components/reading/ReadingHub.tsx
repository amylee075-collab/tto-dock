"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const categories = [
  {
    key: "basic",
    title: "문해력 기초 훈련",
    description: "문장에서 핵심 단어 찾기",
    icon: "📋",
    getHref: () => "/practice/core-word",
  },
  {
    key: "short",
    title: "짧은 글 읽기",
    description: "독서 호기심을 키워요",
    icon: "📖",
    getHref: () => "/reading/short",
  },
  {
    key: "long",
    title: "긴 글 읽기",
    description: "독서 습관을 다져요",
    icon: "📚",
    getHref: () => "/reading/long",
  },
  {
    key: "category",
    title: "분야별 글 읽기",
    description: "배경지식을 넓혀요",
    icon: "🧩",
    getHref: () => "/reading/category",
  },
  {
    key: "digital",
    title: "디지털 문해력",
    description: "비판적 사고력을 갖춰요",
    icon: "📰",
    getHref: () => "/reading/digital",
  },
];

export default function ReadingHub() {
  return (
    <div className="py-8 sm:py-10 w-full">
      <header className="text-center mb-10 sm:mb-12">
        <h1 className="font-extrabold text-2xl sm:text-3xl text-[#212529] tracking-tight mb-2">
          또독 읽기
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          원하는 학습을 골라 읽기를 시작해 보세요.
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
        {categories.map((cat, index) => (
          <li key={cat.key} className="min-w-0">
            <Link href={cat.getHref()} className="block h-full group">
              <motion.article
                className="h-full flex flex-col rounded-xl border border-gray-200 bg-white p-5 sm:p-6 overflow-hidden transition-colors duration-200 group-hover:border-[#FF5C00]/40"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <span
                  className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-[#fff5f0] text-2xl sm:text-3xl mb-4 overflow-hidden"
                  aria-hidden
                >
                  {cat.key === "basic" ? (
                    <Image
                      src="/images/character.png"
                      alt=""
                      width={72}
                      height={72}
                      className="w-full h-full object-contain object-center"
                    />
                  ) : (
                    cat.icon
                  )}
                </span>
                <h2
                  className="font-bold text-xl sm:text-2xl text-[#212529] mb-2"
                  style={{ color: "#212529" }}
                >
                  {cat.title}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed flex-1">
                  {cat.description}
                </p>
              </motion.article>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
