"use client";

import { motion } from "framer-motion";

interface SpeedAreaChartProps {
  data: number[];
}

export default function SpeedAreaChart({ data }: SpeedAreaChartProps) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 100);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * 100,
    y: 90 - ((v - min) / range) * 70,
  }));
  const linePath =
    "M " +
    points.map((p) => `${p.x} ${p.y}`).join(" L ");
  const areaPath =
    `M 0 100 L 0 ${points[0]?.y ?? 100} L ` +
    points.map((p) => `${p.x} ${p.y}`).join(" L ") +
    ` L 100 ${points[points.length - 1]?.y ?? 100} L 100 100 Z`;

  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8 overflow-hidden">
      <h3 className="font-extrabold text-lg text-[#212529] mb-4">
        속도 변화
      </h3>
      <div className="h-44 relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <motion.path
            d={areaPath}
            fill="rgba(255, 87, 0, 0.2)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke="#ff5700"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-500 mt-2">
        최근 7일 읽기 속도 (WPM) 성장 곡선
      </p>
    </section>
  );
}
