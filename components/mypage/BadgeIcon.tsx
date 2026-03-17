"use client";

import * as Icons from "lucide-react";
import type { BadgeCategory } from "@/lib/badges";
import type { LucideIcon } from "lucide-react";

function getIcon(name: string, fallback: LucideIcon): LucideIcon {
  // lucide-react 아이콘 모듈을 안전하게 인덱싱하기 위해 unknown 캐스팅을 한 번 거친다.
  const iconsMap = Icons as unknown as Record<string, LucideIcon | undefined>;
  const Icon = iconsMap[name];
  return Icon ?? fallback;
}

const CATEGORY_COLORS: Record<BadgeCategory, string> = {
  habit: "text-orange-500",
  reading: "text-blue-500",
  quiz: "text-green-500",
  speed: "text-yellow-500",
  deep: "text-purple-500",
  special: "text-pink-500",
};

export interface BadgeIconProps {
  iconName: string;
  subIconName: string;
  isEarned: boolean;
  category: BadgeCategory;
  className?: string;
  size?: "md" | "lg";
}

export default function BadgeIcon({
  iconName,
  subIconName,
  isEarned,
  category,
  className = "",
  size = "md",
}: BadgeIconProps) {
  const isLarge = size === "lg";
  const MainIcon = getIcon(iconName, Icons.Medal);
  const SubIcon = getIcon(subIconName, Icons.Check);
  const colors = CATEGORY_COLORS[category] ?? "text-gray-500";

  return (
    <div
      className={`relative flex items-center justify-center ${
        isLarge ? "w-24 h-24" : "w-16 h-16"
      } transition-transform duration-150 ${className} ${
        isEarned ? colors : "grayscale opacity-30 text-gray-400"
      }`}
    >
      <MainIcon size={isLarge ? 44 : 32} strokeWidth={2} />
      {isEarned && (
        <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
          <SubIcon size={14} strokeWidth={3} className="text-current" />
        </div>
      )}
    </div>
  );
}
