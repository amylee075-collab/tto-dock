"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_MARGIN,
  GROWTH_CHART,
  GROWTH_CHART_STYLE,
  XAXIS_PADDING,
} from "@/lib/growth-chart-layout";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const BAR_SIZE = 32;
const BAR_FILL = "#ff5700";
const LABEL_FILL = "#111827";

interface WeeklyBarChartProps {
  data: number[];
  /** X축 라벨 (길이 7). 있으면 MM/DD 날짜 표시, 없으면 요일 */
  labels?: string[];
}

function hasBarData(data: number[]): boolean {
  return data.some((v) => v > 0);
}

export default function WeeklyBarChart({ data, labels }: WeeklyBarChartProps) {

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

  const xLabels =
    labels && labels.length >= GROWTH_CHART.SLOT_COUNT
      ? labels.slice(0, GROWTH_CHART.SLOT_COUNT)
      : DAY_LABELS;

  const chartData = useMemo(
    () =>
      arr.map((value, i) => ({
        name: xLabels[i],
        value,
      })),
    [arr, xLabels]
  );

  const showBars = hasBarData(arr);
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
  }, [showBars]);

  return (
    <section className={GROWTH_CHART_STYLE.CARD_CLASS}>
      <h3 className={GROWTH_CHART_STYLE.TITLE_CLASS}>주간 학습량</h3>
      <div
        ref={wrapperRef}
        className={GROWTH_CHART_STYLE.CHART_WRAPPER_CLASS}
        style={{ minHeight: GROWTH_CHART_STYLE.CHART_MIN_HEIGHT, height: GROWTH_CHART_STYLE.CHART_MIN_HEIGHT }}
      >
        {showBars ? (
          containerReady ? (
          <ResponsiveContainer
            width="100%"
            minWidth={0}
            minHeight={GROWTH_CHART_STYLE.CHART_MIN_HEIGHT}
          >
            <BarChart
              data={chartData}
              margin={CHART_MARGIN}
              barCategoryGap="12%"
              barGap={4}
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
              <YAxis hide domain={[0, "auto"]} />
              <Bar
                dataKey="value"
                fill={BAR_FILL}
                barSize={BAR_SIZE}
                radius={[4, 4, 0, 0]}
                minPointSize={4}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              >
                <LabelList
                  position="top"
                  content={(props) => {
                    const { x, y, width, value } = props;
                    if (value == null || Number(value) <= 0) return null;
                    const xx = typeof x === "number" ? x : 0;
                    const yy = typeof y === "number" ? y : 0;
                    const ww = typeof width === "number" ? width : 0;
                    const cx = xx + ww / 2;
                    return (
                      <text
                        x={cx}
                        y={yy - 8}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={LABEL_FILL}
                        fontSize={GROWTH_CHART_STYLE.AXIS_LABEL_FONT_SIZE}
                        fontWeight={700}
                      >
                        {value}문장
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          ) : null
        ) : (
          <div
            className="flex items-center justify-center text-sm font-medium text-gray-400 px-4"
            style={{ minHeight: GROWTH_CHART_STYLE.CHART_MIN_HEIGHT }}
          >
            아직 주간 학습 기록이 없어요.
          </div>
        )}
      </div>
    </section>
  );
}
