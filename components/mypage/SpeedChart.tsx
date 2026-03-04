"use client";

import { motion } from "framer-motion";
import { getCPMTier } from "@/lib/hooks/useCPM";
import type { CPMTier } from "@/lib/hooks/useCPM";

interface SpeedChartProps {
  /** 평균 CPM (글자/분). 마이페이지에서는 저장된 lastCpm 사용 */
  averageCpm: number;
}

/** CPM 0~1000 구간을 0~100%로 매핑 (게이지용) */
function cpmToPercent(cpm: number): number {
  const max = 1000;
  return Math.min(100, Math.round((cpm / max) * 100));
}

const statusMessage: Record<CPMTier, string> = {
  차근차근: "꼼꼼하게 읽는 중이네요!",
  안정적: "좋아요! 내용도 잘 이해하고 있나요?",
  빠름: "내용을 파악하며 읽어보세요!",
  "매우 빠름": "주요 내용을 놓치지 않게 조심해요!",
};

const CPM_ZERO_MESSAGE =
  "학습을 시작해서 나의 읽기 속도(글자/분)를 확인해 보세요!";

export default function SpeedChart({ averageCpm }: SpeedChartProps) {
  const { tier } = getCPMTier(averageCpm);
  const percent = cpmToPercent(averageCpm);
  const isZero = averageCpm === 0;
  const message = isZero ? CPM_ZERO_MESSAGE : statusMessage[tier];

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
        {message}
      </p>
    </section>
  );
}
