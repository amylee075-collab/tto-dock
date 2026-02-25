"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";

/** 좌측 LNB: PC에서 260px / 80px(접힘) 토글, md 이상에서만 표시 */
const navItems = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/reading", label: "또독 읽기", icon: "📖" },
  { href: "/mypage", label: "마이페이지", icon: "👤" },
] as const;

const ORANGE = "#FF5C00";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

export default function SideNav() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`hidden md:flex md:flex-col md:items-center md:justify-start md:h-full md:fixed md:inset-y-0 md:left-0 md:shrink-0 md:border-r md:border-gray-100 md:bg-white md:z-30 transition-[width] duration-300 ease-in-out ${
        collapsed ? "md:w-20" : "md:w-64 md:items-stretch"
      }`}
      role="navigation"
      aria-label="좌측 메뉴"
    >
      {/* 헤더: [햄버거 - 또독] flex-row items-center / 접힘 시 텍스트 숨김, 버튼만 가로 중앙 */}
      <div
        className={`shrink-0 flex flex-row items-center w-full border-b border-gray-100 mb-8 ${
          collapsed ? "justify-center py-4 px-0" : "justify-start gap-4 pt-4 pb-4 px-4"
        }`}
      >
        {collapsed ? (
          <div className="flex items-center justify-center w-10 h-10 shrink-0">
            <button
              type="button"
              onClick={toggle}
              className="flex items-center justify-center w-6 h-6 rounded-lg text-[#FF5C00] hover:bg-orange-50 transition-colors"
              aria-label="사이드바 펼치기"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={toggle}
              className="hidden md:flex items-center justify-center w-6 h-6 rounded-lg text-[#FF5C00] hover:bg-orange-50 transition-colors shrink-0"
              aria-label="사이드바 접기"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <Link
              href="/"
              className="font-extrabold text-xl tracking-tight whitespace-nowrap min-w-0"
              style={{ color: ORANGE }}
              aria-label="또독 홈"
              title="또독"
            >
              또독
            </Link>
          </>
        )}
      </div>

      {/* 메뉴: 접힘 시 아이콘만 수직 일직선 중앙, 펼침 시 w-full·균일 패딩·gap-4 */}
      <nav
        className={`w-full overflow-hidden shrink-0 ${
          collapsed ? "flex flex-col items-center" : "flex-1 pt-0 px-3"
        }`}
      >
        <ul
          className={`flex flex-col gap-1 justify-start w-full ${
            collapsed ? "items-center" : ""
          }`}
        >
          {navItems.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <li
                key={href}
                className={`flex h-12 items-center w-full ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`flex items-center h-12 rounded-xl text-lg font-semibold transition-colors ${
                    collapsed
                      ? "justify-center w-10 h-10 rounded-full shrink-0"
                      : "gap-4 px-4 w-full min-w-0"
                  } ${
                    active
                      ? "bg-orange-50 text-[#FF5C00]"
                      : "text-gray-600 hover:bg-orange-50/70 hover:text-[#FF5C00]"
                  }`}
                >
                  <span
                    className="flex items-center justify-center w-6 h-6 shrink-0 text-xl leading-none"
                    aria-hidden
                  >
                    {icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden">
                      {label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
