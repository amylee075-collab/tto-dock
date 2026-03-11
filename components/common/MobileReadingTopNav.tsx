"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileReadingTopNav() {
  const pathname = usePathname();
  const showNav =
    pathname.startsWith("/reading") || pathname.startsWith("/practice/core-word");

  if (!showNav) return null;

  const tabs = [
    { href: "/practice/core-word", label: "문해력 기초 훈련" },
    { href: "/reading", label: "또독 읽기" },
  ] as const;

  return (
    <div className="md:hidden sticky top-0 z-20 -mx-4 sm:-mx-6 border-b border-gray-200 bg-[#f3f4f6]/95 backdrop-blur-sm">
      <nav
        className="grid grid-cols-2 items-stretch px-3"
        aria-label="읽기 상단 메뉴"
      >
        {tabs.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex min-h-[52px] items-center justify-center px-3 text-[15px] font-semibold transition-colors ${
                active
                  ? "text-[#FF5C00]"
                  : "text-gray-700 hover:text-[#FF5C00]"
              }`}
            >
              <span className="truncate">{label}</span>
              {active && (
                <span className="absolute bottom-0 left-1/2 h-[2px] w-12 -translate-x-1/2 rounded-full bg-[#FF5C00]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
