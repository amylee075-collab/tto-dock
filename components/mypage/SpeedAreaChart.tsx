"use client";

import { motion } from "framer-motion";

interface SpeedAreaChartProps {
  data: number[];
  /** X축 라벨 (길이 7). 있으면 MM/DD 표시 */
  labels?: string[];
}

/** 데이터가 2개 이상 쌓였을 때만 선 그래프 활성화 (1개일 때 솟구침 방지) */
function hasEnoughDataForLine(data: number[]): boolean {
  if (!data.length) return false;
  const nonZeroCount = data.filter((v) => v > 0).length;
  return nonZeroCount >= 2;
}

const ZERO_STATE_MESSAGE = "아직 읽기 속도 기록이 없어요.";

export default function SpeedAreaChart({ data, labels }: SpeedAreaChartProps) {
  const showChart = hasEnoughDataForLine(data);
  const arr = data.length >= 7 ? data.slice(0, 7) : [...data, ...Array(7 - data.length).fill(0)].slice(0, 7);
  const max = showChart ? Math.max(...arr, 1) : 1;
  const min = showChart ? Math.min(...arr, max) : 0;
  const range = max - min || 1;
  const points = arr.map((v, i) => ({
    x: (i / 6) * 100,
    y: 90 - ((v - min) / range) * 70,
  }));
  const linePath =
    "M " + points.map((p) => `${p.x} ${p.y}`).join(" L ");
  const areaPath =
    `M 0 100 L 0 ${points[0]?.y ?? 100} L ` +
    points.map((p) => `${p.x} ${p.y}`).join(" L ") +
    ` L 100 ${points[points.length - 1]?.y ?? 100} L 100 100 Z`;

  const emptyMessage = ZERO_STATE_MESSAGE;

  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8 overflow-hidden">
      <h3 className="font-extrabold text-lg text-[#212529] mb-4">
        속도 변화
      </h3>
      <div className="h-44 relative flex items-center justify-center">
        {showChart ? (
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
        ) : (
          <p className="text-sm font-medium text-gray-400 text-center px-4">
            {emptyMessage}
          </p>
        )}
      </div>
      {labels && labels.length >= 7 && (
        <div className="flex justify-between gap-1 mt-2 px-0.5">
          {labels.slice(0, 7).map((label, i) => (
            <span
              key={i}
              className="text-xs font-medium text-gray-500"
            >
              {label}
            </span>
          ))}
        </div>
      )}
      <p className="text-sm font-medium text-gray-500 mt-2">
        7일간 읽기 속도(글자/분) 변화 곡선
      </p>
    </section>
  );
}
