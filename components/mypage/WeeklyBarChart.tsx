"use client";

import { motion } from "framer-motion";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

interface WeeklyBarChartProps {
  data: number[];
}

export default function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  const max = Math.max(...data, 1);

  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8 overflow-hidden">
      <h3 className="font-extrabold text-lg text-[#212529] mb-4">
        주간 학습량
      </h3>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
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
            <span className="text-xs font-medium text-gray-500">
              {DAY_LABELS[i]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
