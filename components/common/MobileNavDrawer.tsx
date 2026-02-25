"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/reading", label: "또독 읽기", icon: "📖" },
  { href: "/mypage", label: "마이페이지", icon: "👤" },
] as const;

const ORANGE = "#FF5C00";

export default function MobileNavDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 모바일에서는 햄버거 미노출, PC에서는 SideNav 토글 버튼 사용 */}

      <AnimatePresence>
        {open && (
          <>
            {/* 배경 클릭 시 닫기 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            {/* 좌측 슬라이드 패널 */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-white border-r border-gray-100 z-50 md:hidden flex flex-col shadow-xl"
              role="dialog"
              aria-label="메뉴"
            >
              <div className="pt-6 pb-6 px-5 border-b border-gray-100 flex items-center justify-between">
                <Link
                  href="/"
                  className="font-extrabold text-xl tracking-tight"
                  style={{ color: ORANGE }}
                  onClick={() => setOpen(false)}
                >
                  또독
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="메뉴 닫기"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 pt-4 px-3 overflow-y-auto">
                <ul className="flex flex-col gap-1">
                  {navItems.map(({ href, label, icon }) => {
                    const active = isActive(href);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-4 min-h-[52px] px-5 py-4 rounded-xl text-lg font-semibold transition-colors ${
                            active
                              ? "bg-orange-50 text-[#FF5C00]"
                              : "text-gray-600 hover:bg-orange-50/70 hover:text-[#FF5C00]"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 shrink-0 text-2xl leading-none" aria-hidden>
                            {icon}
                          </span>
                          <span className="flex-1">{label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
