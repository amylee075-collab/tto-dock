"use client";

import Link from "next/link";

const activities = [
  {
    key: "coreword" as const,
    title: "문해력 기초 훈련",
    subtitle: "문장에서 핵심 단어 찾기",
    icon: "📋",
  },
  {
    key: "short" as const,
    title: "짧은 글 읽기",
    subtitle: "읽기 습관 다지기",
    icon: "📖",
  },
  {
    key: "long" as const,
    title: "긴 글 읽기",
    subtitle: "본문 정독",
    icon: "📚",
  },
];

/** [또독 읽기] 메뉴와 동일한 통합 경로: 긴 글 목록 → 상세 */
const LONG_READING_HREF = "/reading/long";

export default function TodayLearningCards() {
  const cards = [
    {
      ...activities[0],
      href: "/practice/core-word",
    },
    { ...activities[1], href: "/reading/short" },
    { ...activities[2], href: LONG_READING_HREF },
  ];

  return (
    <section id="today-learning" className="scroll-mt-24">
      <h2 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-6 pb-3 border-b border-gray-100">
        오늘의 학습
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
        {cards.map(({ key, title, subtitle, icon, href }) => (
          <li key={key} className="min-w-0">
            <Link
              href={href}
              className="w-full flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px] rounded-2xl border border-gray-200 bg-white p-8 hover:border-[#FF5C00]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/30 overflow-hidden"
            >
              <span
                className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-[#fff5f0] text-3xl sm:text-4xl mb-4"
                aria-hidden
              >
                {icon}
              </span>
              <span className="font-extrabold text-xl sm:text-2xl text-[#212529] text-center">
                {title}
              </span>
              <span className="text-base text-gray-500 font-medium mt-2 text-center">
                {subtitle}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
