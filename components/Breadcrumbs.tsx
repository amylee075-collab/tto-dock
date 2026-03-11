"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { BreadcrumbContext } from "@/contexts/BreadcrumbContext";

const SEGMENT_LABELS: Record<string, string> = {
  reading: "또독 읽기",
  short: "짧은 글 읽기",
  long: "긴 글 읽기",
  category: "분야별 글 읽기",
  digital: "디지털 문해력",
  practice: "문해력 기초 훈련",
  "core-word": "문해력 기초 훈련",
  mypage: "마이페이지",
};

function getSegmentLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment;
}

/** 경로 구분자 (>) */
function Separator() {
  return (
    <span className="text-gray-400 select-none" aria-hidden>
      &gt;
    </span>
  );
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const ctx = useContext(BreadcrumbContext);
  const overrideTitle = ctx?.breadcrumbTitle ?? null;

  const segments = pathname.split("/").filter(Boolean);
  const depth = segments.length;

  // 홈·인증 페이지에서는 미노출
  if (pathname === "/" || pathname.startsWith("/auth")) return null;
  // 최소 2단계 이상에서만 노출
  if (depth < 2) return null;

  const items: { href: string; label: string; isLast: boolean }[] = [];

  // 문해력 기초 훈련(/practice/*): 또독 읽기 > 문해력 기초 훈련
  if (pathname.startsWith("/practice")) {
    items.push({ href: "/reading", label: "또독 읽기", isLast: false });
    items.push({ href: pathname, label: "문해력 기초 훈련", isLast: true });
  } else {
    let acc = "";
    for (let i = 0; i < segments.length; i++) {
      acc += (acc ? "/" : "") + segments[i];
      const isLast = i === segments.length - 1;
      const label = isLast && overrideTitle
        ? overrideTitle
        : getSegmentLabel(segments[i]);
      items.push({ href: `/${acc}`, label, isLast });
    }
  }

  return (
    <nav
      aria-label="브레드크럼"
      className="breadcrumb-nav sticky top-0 z-10 bg-white pt-2 pb-2 mb-3 text-[13px] text-gray-500 border-b border-gray-100"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 && <Separator />}
            {item.isLast ? (
              <span className="text-gray-700 font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-[#ff5700] transition-colors focus:outline-none border-0 outline-none ring-0 focus:ring-0"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
