"use client";

import Link from "next/link";
import ThumbnailWithFallback from "@/components/reading/ThumbnailWithFallback";

interface StoryCardProps {
  href: string;
  thumbnail: string;
  title: string;
  badges?: string[];
}

/** 분야별/디지털 카드에서 공유하는 공통 레이아웃 */
export default function StoryCard({
  href,
  thumbnail,
  title,
  badges,
}: StoryCardProps) {
  return (
    <li className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden min-w-0 w-full">
      <div className="aspect-video relative w-full overflow-hidden bg-gray-100 shrink-0">
        <ThumbnailWithFallback
          src={thumbnail}
          alt=""
          sizes="(max-width:1024px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {badges?.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-[#fff5f0] px-3 py-1.5 text-base font-bold text-[#ff5700]"
            >
              {badge}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-2xl text-[#212529] leading-tight mb-5 line-clamp-2">
          {title}
        </h3>
        <Link
          href={href}
          className="mt-auto inline-flex justify-center items-center rounded-lg px-5 py-3 text-base font-bold text-white shadow-sm hover:opacity-90 transition-opacity bg-[#ff5700]"
        >
          학습 시작
        </Link>
      </div>
    </li>
  );
}

