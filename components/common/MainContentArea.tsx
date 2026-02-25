"use client";

import { useSidebar } from "@/contexts/SidebarContext";

interface MainContentAreaProps {
  children: React.ReactNode;
}

/** PC에서 사이드바 너비에 맞춰 좌측 패딩을 w-64(256px) / 80px 로 전환 (애니메이션) */
export default function MainContentArea({ children }: MainContentAreaProps) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={`flex flex-col h-screen overflow-hidden transition-[padding] duration-300 ease-in-out ${
        collapsed ? "md:pl-20" : "md:pl-64"
      }`}
    >
      {children}
    </div>
  );
}
