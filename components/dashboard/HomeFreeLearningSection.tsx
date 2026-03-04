"use client";

import Link from "next/link";

const MENUS = [
  {
    key: "short",
    title: "짧은 글 읽기",
    subtitle: "가볍게 한 편 읽기",
    href: "/reading/short",
    icon: "📖",
  },
  {
    key: "long",
    title: "긴 글 읽기",
    subtitle: "본문 정독",
    href: "/reading/long",
    icon: "📚",
  },
  {
    key: "category",
    title: "분야별 글 읽기",
    subtitle: "과학 / 역사 / 사회",
    href: "/reading/category",
    icon: "🧩",
  },
  {
    key: "digital",
    title: "디지털 문해력",
    subtitle: "신문·미디어 비판",
    href: "/reading/digital",
    icon: "📰",
  },
] as const;

export default function HomeFreeLearningSection() {
  return (
    <section
      id="free-learning"
      className="scroll-mt-24 w-full"
      aria-labelledby="free-learning-title"
    >
      <h2
        id="free-learning-title"
        className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-6"
      >
        자유 학습
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full">
        {MENUS.map(({ key, title, subtitle, href, icon }) => (
          <li key={key} className="min-w-0">
            <Link
              href={href}
              className="w-full flex flex-col items-center justify-center min-h-[160px] sm:min-h-[180px] rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 hover:border-[#ff5700]/50 hover:bg-[#fffaf8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5700]/30"
            >
              <span
                className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-[#fff5f0] text-2xl sm:text-3xl mb-3"
                aria-hidden
              >
                {icon}
              </span>
              <span className="font-extrabold text-lg sm:text-xl text-[#212529] text-center">
                {title}
              </span>
              <span className="text-sm text-gray-500 font-medium mt-1 text-center">
                {subtitle}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
