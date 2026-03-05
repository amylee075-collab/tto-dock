"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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

/** 로그인 버튼용: 원형 + 사용자 실루엣 (다크 그레이 스타일) */
function UserIcon({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 ${className}`} aria-hidden>
      <svg
        className="w-[14px] h-[14px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </span>
  );
}

/** 한글 4자 이상 → 3자 + "...", 영어 7자 이상 → 6자 + "...", 그 외 전체 */
function truncateDisplayName(name: string): string {
  if (!name || !name.trim()) return name;
  const trimmed = name.trim();
  const koreanCount = (trimmed.match(/[가-힣]/g) || []).length;
  if (koreanCount >= 4) return trimmed.slice(0, 3) + "...";
  if (trimmed.length >= 7) return trimmed.slice(0, 6) + "...";
  return trimmed;
}

export default function SideNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
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
      {/* 헤더: 높이·하단 보더 고정. 접힘 시 로고는 opacity-0 + absolute로 공간 미점유, 버튼만 중앙 */}
      <div
        className={`shrink-0 flex flex-row items-center w-full border-b border-gray-100 mb-8 min-h-14 h-14 relative ${
          collapsed ? "px-0" : "px-4"
        }`}
      >
        <div
          className={`flex flex-row items-center w-full h-full shrink-0 ${
            collapsed ? "justify-center" : "justify-start gap-4"
          }`}
        >
          <button
            type="button"
            onClick={toggle}
            className="flex items-center justify-center w-6 h-6 rounded-lg text-[#FF5C00] hover:bg-orange-50 transition-colors shrink-0"
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            <MenuIcon className="w-6 h-6 shrink-0" />
          </button>
          <Link
            href="/"
            className={`font-extrabold text-xl tracking-tight whitespace-nowrap shrink-0 ${
              collapsed
                ? "absolute left-0 top-0 opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
                : "min-w-0"
            }`}
            style={{ color: ORANGE }}
            aria-label="또독 홈"
            title="또독"
          >
            또독
          </Link>
        </div>
      </div>

      {/* 메뉴: 상단에 홈/읽기/마이페이지, 맨 아래에 로그인/로그아웃 고정 */}
      <nav
        className={`w-full overflow-hidden flex flex-col flex-1 min-h-0 ${
          collapsed ? "items-center" : "px-3"
        }`}
      >
        <ul
          className={`flex flex-col gap-1 w-full shrink-0 ${
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
        {/* 빈 공간으로 로그인을 LNB 맨 아래로 밀기 */}
        <div className="flex-1 min-h-0 shrink-0" aria-hidden />
        <div className={`w-full shrink-0 pt-2 border-t border-gray-100 ${collapsed ? "flex justify-center" : ""}`}>
          {status === "loading" ? (
            <span className="flex items-center h-12 gap-4 px-4 text-gray-400 text-sm">
              {!collapsed && "확인 중..."}
            </span>
          ) : session ? (
            <div className={`flex h-12 items-center gap-3 w-full min-w-0 ${collapsed ? "justify-center" : "px-1"}`}>
              {collapsed ? (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 text-gray-600 hover:bg-orange-50/70 hover:text-[#FF5C00] transition-colors"
                  title="로그아웃"
                >
                  <span className="text-xl leading-none" aria-hidden>🚪</span>
                </button>
              ) : (
                <>
                  <span className="shrink-0 flex items-center justify-center">
                    <UserIcon className="w-9 h-9" />
                  </span>
                  <span
                    className="flex-1 min-w-0 truncate text-sm text-[#212529]"
                    title={session.user?.email ?? undefined}
                  >
                    {truncateDisplayName(session.user?.name || session.user?.email || "회원")}님
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="shrink-0 text-sm text-[#212529] underline hover:text-[#FF5C00] transition-colors"
                    title="로그아웃"
                  >
                    로그아웃
                  </button>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={`flex items-center h-12 rounded-xl text-lg font-semibold transition-colors text-gray-600 hover:bg-gray-100 hover:text-[#212529] ${
                collapsed ? "justify-center w-10 h-10 rounded-full shrink-0" : "gap-3 px-4 w-full min-w-0"
              }`}
              title="로그인"
            >
              <span className="flex items-center justify-center w-6 h-6 shrink-0">
                <UserIcon className="w-6 h-6" />
              </span>
              {!collapsed && <span>로그인</span>}
            </Link>
          )}
        </div>
      </nav>
    </aside>
  );
}
