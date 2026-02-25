"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

interface WeeklyBarChartProps {
  data: number[];
  /** X축 라벨 (길이 7). 있으면 MM/DD 날짜 표시, 없으면 요일 */
  labels?: string[];
}

function hasBarData(data: number[]): boolean {
  return data.some((v) => v > 0);
}

export default function WeeklyBarChart({ data, labels }: WeeklyBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const showBars = hasBarData(data);
  const max = Math.max(...data, 1);
  const xLabels = labels && labels.length >= 7 ? labels.slice(0, 7) : DAY_LABELS;

  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8 overflow-hidden">
      <h3 className="font-extrabold text-lg text-[#212529] mb-4">
        주간 학습량
      </h3>
      <div className="flex items-end justify-between gap-2 h-40">
        {showBars ? (
          data.slice(0, 7).map((value, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 relative"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              title={`${xLabels[i]}: ${value}문장`}
            >
              <div className="h-28 w-full flex flex-col items-center">
                {value > 0 && (
                  <span className="text-xs font-bold text-[#212529] mb-0.5 tabular-nums shrink-0">
                    {value}문장
                  </span>
                )}
                <div className="flex-1 min-h-0 w-full flex justify-center items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / max) * 100}%` }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.08,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="w-full max-w-[2rem] rounded-t bg-ttodock-orange min-h-[4px]"
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {xLabels[i]}
              </span>
              {hoveredIndex === i && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-gray-800 text-white text-xs font-medium whitespace-nowrap z-10 pointer-events-none"
                  role="tooltip"
                >
                  {xLabels[i]}: {value}문장
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-full flex items-center justify-center h-full min-h-[8rem]">
            <p className="text-sm font-medium text-gray-400 text-center px-4">
              아직 주간 학습 기록이 없어요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
