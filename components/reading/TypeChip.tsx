"use client";

/**
 * 어드민에서 지정한 유형(과학, 사회, 예술 등)을 컬러 칩으로 표시.
 * section / badges 데이터를 유형별 배경색으로 구분.
 */
const TYPE_STYLES: Record<string, string> = {
  문학: "bg-blue-100 text-blue-800",
  비문학: "bg-blue-100 text-blue-800",
  과학: "bg-blue-100 text-blue-800",
  사회: "bg-blue-100 text-blue-800",
  역사: "bg-blue-100 text-blue-800",
  예술: "bg-blue-100 text-blue-800",
  "기술·AI": "bg-blue-100 text-blue-800",
  디지털: "bg-indigo-100 text-indigo-800",
  "신문 기사": "bg-slate-200 text-slate-700",
  "미디어 비판": "bg-slate-200 text-slate-700",
  "짧은 글": "bg-orange-100 text-orange-800",
  "긴 글": "bg-slate-200 text-slate-800",
  신문기사: "bg-slate-200 text-slate-700",
  쉬움: "bg-gray-100 text-gray-700",
  어려움: "bg-gray-200 text-gray-800",
};

const DEFAULT_STYLE = "bg-gray-100 text-gray-700";

interface TypeChipProps {
  label: string;
}

export default function TypeChip({ label }: TypeChipProps) {
  const style = TYPE_STYLES[label] ?? DEFAULT_STYLE;
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-sm font-medium ${style}`}
    >
      {label}
    </span>
  );
}
