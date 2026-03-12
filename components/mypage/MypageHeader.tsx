"use client";

import { useSession } from "next-auth/react";

export interface RepresentativeBadge {
  icon: string;
  title: string;
}

interface MypageHeaderProps {
  title: string;
  /** 우측 대표 배지. null이면 미획득 안내 */
  representativeBadge: RepresentativeBadge | null;
}

export default function MypageHeader({
  title,
  representativeBadge,
}: MypageHeaderProps) {
  const { data: session } = useSession();
  const displayName =
    session?.user?.name?.trim() || session?.user?.email?.trim() || "학습자";

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="font-extrabold text-2xl text-[#212529]">{title}</h1>
        <p className="mt-1 text-gray-600 font-medium">{displayName}님</p>
      </div>
      <div
        className="flex h-[8rem] min-h-[8rem] w-[10rem] min-w-[10rem] max-w-[12rem] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 shadow-sm"
        aria-label="대표 배지"
      >
        {representativeBadge ? (
          <>
            <span
              className="text-4xl md:text-5xl leading-none shrink-0"
              aria-hidden
            >
              {representativeBadge.icon}
            </span>
            <span className="text-base font-bold text-[#FF5C00] text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {representativeBadge.title}
            </span>
          </>
        ) : (
          <>
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-2xl font-bold"
              aria-hidden
            >
              !
            </span>
            <span className="text-base font-bold text-gray-600 text-center leading-tight whitespace-nowrap">
              배지를 모아봐요!
            </span>
          </>
        )}
      </div>
    </header>
  );
}
