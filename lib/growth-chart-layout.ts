/**
 * 주간 학습량 / 속도 변화 차트 공통 레이아웃
 * - 고정 너비 없음. ResponsiveContainer + margin으로 반응형·정렬 통일
 */

export const GROWTH_CHART = {
  SLOT_COUNT: 7,
} as const;

/** Recharts margin (두 그래프 완전 동일 → 수직 그리드·좌표 일치) */
export const CHART_MARGIN = {
  top: 40,
  right: 30,
  left: 30,
  bottom: 36,
} as const;

/** X축 패딩: scale="point"와 함께 첫/끝 날짜가 차트 끝에 붙지 않도록 (두 차트 동일) */
export const XAXIS_PADDING = {
  left: 50,
  right: 50,
} as const;

export const GROWTH_CHART_STYLE = {
  CARD_CLASS:
    "w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8 overflow-hidden",
  TITLE_CLASS: "font-extrabold text-lg text-[#212529] mb-4",
  SUBTITLE_CLASS: "text-sm font-medium text-gray-500 mt-2",
  AXIS_LABEL_FONT_SIZE: 12,
  AXIS_LABEL_FILL: "#6B7280",
  GRID_STROKE: "#E5E7EB",
  GRID_STROKE_DASHARRAY: "3 3",
  /** 차트 영역 최소 높이 (PC에서 시원하게) */
  CHART_MIN_HEIGHT: 280,
  /** 차트 래퍼: 너비·비율·패딩 통일용 */
  CHART_WRAPPER_CLASS: "w-full overflow-visible",
} as const;
