/**
 * 주간 학습량 / 속도 변화 차트 공통 레이아웃
 * - 고정 너비 없음. ResponsiveContainer + margin으로 반응형·정렬 통일
 */

export const GROWTH_CHART = {
  SLOT_COUNT: 7,
} as const;

/** Recharts margin (두 그래프 동일 → 수직 그리드·좌표 일치). 여백 축소 */
export const CHART_MARGIN = {
  top: 24,
  right: 16,
  left: 16,
  bottom: 24,
} as const;

/** X축 패딩: scale="point"용. 여백 축소 (두 차트 동일) */
export const XAXIS_PADDING = {
  left: 24,
  right: 24,
} as const;

export const GROWTH_CHART_STYLE = {
  /** 카드 패딩·하단 여백 축소. growth-chart-card: 양끝 세로 그리드선 제거용 */
  CARD_CLASS:
    "growth-chart-card w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-3 md:p-4 shadow-sm mb-5 overflow-hidden",
  TITLE_CLASS: "font-extrabold text-lg text-[#212529] mb-2",
  SUBTITLE_CLASS: "text-sm font-medium text-gray-500 mt-2",
  AXIS_LABEL_FONT_SIZE: 12,
  AXIS_LABEL_FILL: "#6B7280",
  GRID_STROKE: "#E5E7EB",
  GRID_STROKE_DASHARRAY: "3 3",
  /** 차트 영역 최소 높이 (PC에서 시원하게) */
  CHART_MIN_HEIGHT: 280,
  /** 차트 래퍼: 최소 너비 1px로 ResponsiveContainer width(-1) 경고 방지 */
  CHART_WRAPPER_CLASS: "w-full min-w-[1px] overflow-visible",
} as const;
