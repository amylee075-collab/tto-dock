"use client";

import { motion } from "framer-motion";
import { getWPMTier } from "@/lib/hooks/useWPM";
import type { WPMTier } from "@/lib/hooks/useWPM";

interface SpeedChartProps {
  averageWpm: number;
}

/** WPM 0~200 구간을 0~100%로 매핑 (게이지용) */
function wpmToPercent(wpm: number): number {
  const max = 200;
  return Math.min(100, Math.round((wpm / max) * 100));
}

const statusMessage: Record<WPMTier, string> = {
  느림: "꼼꼼하게 정독 중",
  보통: "적당한 속도로 읽고 있어요",
  빠름: "속도를 조절해 보아요",
};

export default function SpeedChart({ averageWpm }: SpeedChartProps) {
  const tier = getWPMTier(averageWpm);
  const percent = wpmToPercent(averageWpm);

  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8 overflow-hidden">
      <p className="text-sm font-medium text-gray-500 mb-3">읽기 속도</p>
      <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="h-full rounded-full bg-ttodock-orange"
          style={{ backgroundColor: "#ff5700" }}
        />
      </div>
      <p className="mt-3 font-bold text-[#212529] text-lg">
        {statusMessage[tier]}
      </p>
    </section>
  );
}
