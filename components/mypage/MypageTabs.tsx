"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/mypage/info", label: "내 정보" },
  { href: "/mypage/growth-report", label: "나의 성장 리포트" },
] as const;

export default function MypageTabs() {
  const pathname = usePathname();

  return (
    <nav className="mt-2 mb-6 border-b border-gray-100 md:hidden">
      <ul className="flex gap-4 text-sm">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`pb-2 inline-flex items-center border-b-2 transition-colors ${
                  active
                    ? "border-[#FF5C00] text-[#FF5C00] font-bold"
                    : "border-transparent text-gray-500 hover:text-[#FF5C00]"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

