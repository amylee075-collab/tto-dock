"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** 모바일(md 미만) 전용 하단 고정 탭바 - 오렌지 포인트 (Tailwind md:hidden만 사용) */
const tabs = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/reading", label: "또독 읽기", icon: "📖" },
  { href: "/mypage", label: "마이페이지", icon: "👤" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-orange-100 bg-white safe-area-pb"
      role="navigation"
      aria-label="하단 메뉴"
    >
      <ul className="flex items-center justify-around h-14 w-full px-2 sm:px-4">
        {tabs.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1 min-w-0">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg transition-colors ${
                  active
                    ? "text-[#FF5C00] bg-orange-50 font-semibold"
                    : "text-gray-500 hover:bg-orange-50/50"
                }`}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {icon}
                </span>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
