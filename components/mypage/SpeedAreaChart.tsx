"use client";

import { useId, useMemo, useState, useRef, useEffect } from "react";
import {
  Area,
  ComposedChart,
  Label,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_MARGIN,
  GROWTH_CHART,
  GROWTH_CHART_STYLE,
  XAXIS_PADDING,
} from "@/lib/growth-chart-layout";

const ACCENT = "#F97316";
const ZERO_STATE_MESSAGE = "아직 읽기 속도 기록이 없어요.";

interface SpeedAreaChartProps {
  data: number[];
  /** X축 라벨 (길이 7). 있으면 MM/DD 표시 */
  labels?: string[];
}

function hasLineData(data: number[]): boolean {
  return data.some((v) => v > 0);
}

/** 그라데이션 영역용 defs (글로우/필터 없음) */
function SpeedChartDefs({ gradientId }: { gradientId: string }) {
  return (
    <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
          <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** 평면 라벨용 텍스트 색 (배경과 대비 확보) */
const LABEL_FILL = "#111827";

export default function SpeedAreaChart({ data, labels }: SpeedAreaChartProps) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `speed-area-gradient-${uid}`;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const arr = useMemo(
    () =>
      data.length >= GROWTH_CHART.SLOT_COUNT
        ? data.slice(0, GROWTH_CHART.SLOT_COUNT)
        : [...data, ...Array(GROWTH_CHART.SLOT_COUNT - data.length).fill(0)].slice(
            0,
            GROWTH_CHART.SLOT_COUNT
          ),
    [data]
  );

  const displayLabels = useMemo(
    () =>
      labels && labels.length >= GROWTH_CHART.SLOT_COUNT
        ? labels.slice(0, GROWTH_CHART.SLOT_COUNT)
        : Array.from(
            { length: GROWTH_CHART.SLOT_COUNT },
            (_, i) => `${String(i + 1).padStart(2, "0")}`
          ),
    [labels]
  );

  const chartData = useMemo(
    () =>
      arr.map((value, i) => ({
        name: displayLabels[i],
        value: value,
      })),
    [arr, displayLabels]
  );

  const showChart = hasLineData(arr);
  const peakIndex = useMemo(
    () => chartData.reduce((best, d, i) => (d.value > chartData[best].value ? i : best), 0),
    [chartData]
  );
  const peak = chartData[peakIndex];

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerReady, setContainerReady] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const check = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setContainerReady((prev) => (prev ? true : w > 0 && h > 0));
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showChart]);

  return (
    <section className={GROWTH_CHART_STYLE.CARD_CLASS}>
      <SpeedChartDefs gradientId={gradientId} />
      <h3 className={GROWTH_CHART_STYLE.TITLE_CLASS}>속도 변화</h3>
      <div
        ref={wrapperRef}
        className={GROWTH_CHART_STYLE.CHART_WRAPPER_CLASS}
        style={{ minHeight: GROWTH_CHART_STYLE.CHART_MIN_HEIGHT, height: GROWTH_CHART_STYLE.CHART_MIN_HEIGHT }}
      >
        {showChart ? (
          containerReady ? (
          <ResponsiveContainer
            width="100%"
            minWidth={0}
            minHeight={GROWTH_CHART_STYLE.CHART_MIN_HEIGHT}
          >
            <ComposedChart
              data={chartData}
              margin={CHART_MARGIN}
              onMouseMove={(e) => {
                const idx = e?.activeTooltipIndex ?? null;
                setHoveredIndex(typeof idx === "number" ? idx : null);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <XAxis
                type="category"
                dataKey="name"
                scale="point"
                interval={0}
                padding={XAXIS_PADDING}
                tick={{
                  fill: GROWTH_CHART_STYLE.AXIS_LABEL_FILL,
                  fontSize: GROWTH_CHART_STYLE.AXIS_LABEL_FONT_SIZE,
                  fontWeight: 500,
                }}
                axisLine={{ stroke: GROWTH_CHART_STYLE.GRID_STROKE }}
                tickLine={false}
              />
              <YAxis
                domain={[0, "auto"]}
                hide
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                      <span className="text-xs font-semibold text-gray-500">{d.name}</span>
                      <span className="ml-2 text-sm font-bold text-[#212529]">{d.value}</span>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill={`url(#${gradientId})`}
                isAnimationActive
                animationDuration={600}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={ACCENT}
                strokeWidth={2.5}
                dot={({ cx, cy, index, value }) => {
                  const hasValue = value != null && Number(value) > 0;
                  const isHovered = hoveredIndex === index;
                  if (!hasValue && !isHovered) return null;
                  const r = isHovered ? 8 : 6;
                  return (
                    <circle
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="white"
                      stroke={ACCENT}
                      strokeWidth={isHovered ? 2.5 : 2}
                    />
                  );
                }}
                activeDot={false}
                isAnimationActive
                animationDuration={600}
              />
              {peak && peak.value > 0 && (
                <ReferenceDot
                  x={peak.name}
                  y={peak.value}
                  r={0}
                  fill="transparent"
                >
                  <Label
                    value={peak.value}
                    position="top"
                    offset={8}
                    content={({ x, y, value }) => {
                      const xx = typeof x === "number" ? x : 0;
                      const yy = typeof y === "number" ? y : 0;
                      return (
                        <g>
                          <rect
                            x={xx - 24}
                            y={yy - 32}
                            width={48}
                            height={24}
                            rx={6}
                            fill="#F3F4F6"
                            stroke="#E5E7EB"
                            strokeWidth={1}
                          />
                          <text
                            x={xx}
                            y={yy - 20}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={LABEL_FILL}
                            fontSize={11}
                            fontWeight={600}
                          >
                            {value}
                          </text>
                        </g>
                      );
                    }}
                  />
                </ReferenceDot>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          ) : null
        ) : (
          <div
            className="flex items-center justify-center text-sm font-medium text-gray-400 px-4"
            style={{ minHeight: GROWTH_CHART_STYLE.CHART_MIN_HEIGHT }}
          >
            {ZERO_STATE_MESSAGE}
          </div>
        )}
      </div>
      <p className={GROWTH_CHART_STYLE.SUBTITLE_CLASS}>
        최근 7일 읽기 속도(글자/분) 변화
      </p>
    </section>
  );
}
