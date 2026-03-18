// 파일 인코딩 강제 고정: UTF-8
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { getFeedbackFromStats } from "@/lib/mypage-data";
import {
  aggregateDashboardStatsFromLogs,
  EMPTY_DASHBOARD_STATS,
  getLast7KstDateKeys,
  type StudyLogRecord,
} from "@/lib/study-log-types";
import { getCPMTier } from "@/lib/hooks/useCPM";
import { STUDY_LOGS_UPDATED_EVENT, useUserStatus } from "@/hooks/useUserStatus";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from "recharts";
import WeeklyBarChart from "@/components/mypage/WeeklyBarChart";
import SpeedAreaChart from "@/components/mypage/SpeedAreaChart";
import MypageTabs from "@/components/mypage/MypageTabs";

function getDisplayName(name?: string | null, email?: string | null): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  const trimmedEmail = email?.trim();
  if (trimmedEmail) return trimmedEmail;
  return "사용자";
}

function buildLearnerOneLineAnalysis(
  displayName: string,
  averageWpm: number,
  accuracy: number
): string {
  const { tier } = getCPMTier(averageWpm);
  const accuracyLabel =
    accuracy >= 80 ? "내용을 잘 파악하고" : accuracy >= 60 ? "이해도가 안정적이며" : "꼼꼼히 읽으려 노력하며";

  if (tier === "매우 빠름") {
    return `${displayName}님은 아주 빠른 흐름을 유지하면서 ${accuracyLabel} 읽고 있어요.`;
  }
  if (tier === "안정적") {
    return `${displayName}님은 이상적인 속도로 글을 읽으며 ${accuracyLabel} 있어요.`;
  }
  if (tier === "차근차근") {
    return `${displayName}님은 아주 꼼꼼하게 한 문장씩 ${accuracyLabel} 학습해요.`;
  }
  if (tier === "빠름") {
    return `${displayName}님은 빠른 흐름을 유지하며 ${accuracyLabel} 있어요.`;
  }
  return `${displayName}님은 나만의 읽기 리듬을 찾으며 ${accuracyLabel} 있어요.`;
}

function buildBalanceInsight(averageWpm: number, accuracy: number): {
  title: string;
  description: string;
} {
  const { tier } = getCPMTier(averageWpm);

  if (accuracy >= 80 && tier === "안정적") {
    return {
      title: "완벽 균형",
      description: "읽기 속도와 이해도의 균형이 아주 훌륭한 상태입니다.",
    };
  }
  if (accuracy >= 80 && tier === "매우 빠름") {
    return {
      title: "쾌속 정독",
      description: "빠른 속도로 글을 읽으면서도 핵심을 놓치지 않고 있어요.",
    };
  }
  if (accuracy < 60 && (tier === "빠름" || tier === "매우 빠름")) {
    return {
      title: "속도 조절 필요",
      description: "조금만 천천히 읽어볼까요? 내용을 더 잘 파악할 수 있을 거예요.",
    };
  }

  return {
    title: "성장 중",
    description: "나만의 리듬을 찾아가는 중이에요. 꾸준히 읽는 것이 가장 중요해요.",
  };
}

function buildMission(stats: {
  streakDays: number;
  todayAccuracy: number;
  averageWpm: number;
  totalSentencesRead: number;
}): string {
  if (stats.streakDays < 3) {
    return "이번 주 3일 연속 출석 미션에 도전해 보세요!";
  }
  if (stats.todayAccuracy < 80) {
    return "다음 퀴즈에서는 정답률 80% 이상을 목표로 해볼까요?";
  }
  if (stats.averageWpm > 700) {
    return "조금만 속도를 늦춰서 문장 사이의 숨은 뜻을 찾아보세요.";
  }
  if (stats.totalSentencesRead < 100) {
    return "누적 읽은 문장 100개 돌파 미션까지 얼마 안 남았어요!";
  }
  return "매일 10분씩, 나만의 사고력 노트를 채워보는 건 어떨까요?";
}

function GrowthSectionCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const hasHeader = Boolean(title || subtitle);
  return (
    <section className="pt-0 pb-10 border-b border-gray-100">
      {hasHeader && (
        <div className="mb-4">
          {title ? (
            <p className="text-[20px] font-semibold text-slate-800">{title}</p>
          ) : null}
          {subtitle ? (
            <h3 className="mt-1 text-xl font-extrabold text-[#212529]">{subtitle}</h3>
          ) : null}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}

function GrowthSkeletonCard({ blocks = 3 }: { blocks?: number }) {
  return (
    <GrowthSectionCard title="리포트 데이터를 분석하고 있어요..." subtitle="잠시만 기다려주세요">
      <div className="animate-pulse space-y-3">
        {Array.from({ length: blocks }).map((_, index) => (
          <div key={index} className="h-20 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </GrowthSectionCard>
  );
}

/** 방사형 그래프: 영역 라벨을 바깥으로 밀어 축 숫자와 겹치지 않게 함 (최소 20px 여백) */
function renderAngleAxisTick(
  cx: number,
  cy: number,
  outerRadius: number,
  paddingPx: number,
  fontSize: number,
  fontWeight: number
) {
  return (props: { x?: string | number; y?: string | number; payload?: { value?: string; subject?: string } }) => {
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const label = props.payload?.value ?? props.payload?.subject ?? "";
    const r = Math.hypot(x - cx, y - cy) || 1;
    const dx = ((x - cx) / r) * paddingPx;
    const dy = ((y - cy) / r) * paddingPx;
    return (
      <g style={{ zIndex: 10 }} className="pointer-events-none">
        <text
          x={x + dx}
          y={y + dy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#212529"
          fontSize={fontSize}
          fontWeight={fontWeight}
        >
          {label}
        </text>
      </g>
    );
  };
}

export default function GrowthReportDashboard() {
  const { data: session } = useSession();
  const { isAuthenticated, authStatus, loadStudyLogs } = useUserStatus();
  const [stats, setStats] = useState({ ...EMPTY_DASHBOARD_STATS });
  const [readingLogs, setReadingLogs] = useState<StudyLogRecord<"reading_session">[]>([]);
  const [loading, setLoading] = useState(true);
  const emptyRetryRef = useRef(false);
  const [profileNickname, setProfileNickname] = useState<string | null>(null);

  const refresh = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const nextLogs = (await loadStudyLogs("reading_session")) as StudyLogRecord<"reading_session">[];
    const sortedLogs = [...nextLogs].sort((a, b) => {
      const aTime = new Date(
        a.completedAt ?? a.updatedAt ?? a.createdAt ?? `${a.kstDate}T00:00:00`
      ).getTime();
      const bTime = new Date(
        b.completedAt ?? b.updatedAt ?? b.createdAt ?? `${b.kstDate}T00:00:00`
      ).getTime();
      return bTime - aTime;
    });

    setReadingLogs(sortedLogs);
    setStats(aggregateDashboardStatsFromLogs(sortedLogs));
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      emptyRetryRef.current = false;
      return;
    }
    emptyRetryRef.current = false;
    void refresh();
  }, [isAuthenticated, loadStudyLogs]);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfileNickname(null);
      return;
    }
    let alive = true;
    const loadProfileNickname = async () => {
      try {
        const res = await fetch("/api/mypage/profile", { cache: "no-store" });
        const json = (await res.json()) as { profile?: { nickname?: string | null } };
        if (!alive) return;
        const next = json.profile?.nickname?.trim();
        setProfileNickname(next && next.length > 0 ? next : null);
      } catch {
        if (!alive) return;
        setProfileNickname(null);
      }
    };
    void loadProfileNickname();
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const silentRefresh = () => void refresh(false);
    const onStudyLogsUpdated = silentRefresh;
    const onFocus = silentRefresh;
    const onVisibility = () => {
      if (document.visibilityState === "visible") silentRefresh();
    };

    if (!isAuthenticated) return;

    window.addEventListener(STUDY_LOGS_UPDATED_EVENT, onStudyLogsUpdated);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener(STUDY_LOGS_UPDATED_EVENT, onStudyLogsUpdated);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAuthenticated]);

  const displayName =
    profileNickname?.trim() || getDisplayName(session?.user?.name, session?.user?.email);
  const feedback = useMemo(() => getFeedbackFromStats(stats), [stats]);
  const hasGrowthData = stats?.hasAnyData || readingLogs.length > 0;
  const last7Keys = useMemo(() => getLast7KstDateKeys(), []);
  const learnerAnalysis = useMemo(
    () => buildLearnerOneLineAnalysis(displayName, stats?.averageWpm ?? 0, stats?.todayAccuracy ?? 0),
    [displayName, stats?.averageWpm, stats?.todayAccuracy]
  );

  const habitCards = useMemo(() => {
    const speedTier = getCPMTier(stats?.averageWpm ?? 0).tier;
    const balanceInsight = buildBalanceInsight(stats?.averageWpm ?? 0, stats?.todayAccuracy ?? 0);

    return [
      {
        title: "읽기 리듬",
        value: speedTier,
        description:
          speedTier === "매우 빠름"
            ? "아주 빠른 흐름으로 글을 읽고 있습니다."
            : speedTier === "안정적"
              ? "글을 이해하기에 아주 적절한 속도입니다."
              : speedTier === "차근차근"
                ? "꼼꼼하게 한 줄씩 정성 들여 읽고 있습니다."
                : speedTier === "빠름"
                  ? "빠른 흐름을 유지하며 읽고 있어요."
                  : "나만의 읽기 속도를 차근차근 만들어가고 있어요.",
      },
      {
        title: "이해도",
        value:
          (stats?.todayAccuracy ?? 0) >= 80
            ? "훌륭함"
            : (stats?.todayAccuracy ?? 0) >= 60
              ? "안정적"
              : "노력 중",
        description:
          (stats?.todayAccuracy ?? 0) >= 80
            ? "글의 중심 내용을 아주 정확하게 파악하고 있어요."
            : (stats?.todayAccuracy ?? 0) >= 60
              ? "글의 핵심을 이해하며 차분히 학습하고 있습니다."
              : "문장 사이의 뜻을 더 깊이 생각하며 읽어볼까요?",
      },
      {
        title: "읽기 습관 균형",
        value: balanceInsight.title,
        description: balanceInsight.description,
      },
    ];
  }, [stats?.averageWpm, stats?.todayAccuracy]);

  const rhythmCard = habitCards[0];
  const balanceCard = habitCards[2];

  const weeklyData = stats?.weeklySentencesByDay ?? EMPTY_DASHBOARD_STATS.weeklySentencesByDay;
  const speedChartData = stats?.weeklyWpmByDay ?? EMPTY_DASHBOARD_STATS.weeklyWpmByDay;

  const activitySummaryCards = useMemo(() => {
    const last7Logs = readingLogs.filter((log) => last7Keys.includes(log.kstDate));
    const totalSentences = last7Logs.reduce((sum, log) => sum + Number(log?.payload?.sentencesRead ?? 0), 0);
    const totalQuizCorrect = last7Logs.reduce((sum, log) => sum + Number(log?.payload?.quizCorrect ?? 0), 0);
    const totalQuizTotal = last7Logs.reduce((sum, log) => sum + Number(log?.payload?.quizTotal ?? 0), 0);
    const cpmValues = last7Logs
      .map((log) => Number(log?.payload?.cpm ?? 0))
      .filter((value) => value > 0);
    const learningDays = new Set(last7Logs.map((log) => log.kstDate)).size;

    return [
      { label: "학습 일수", value: `${learningDays}일` },
      { label: "읽은 문장", value: `${totalSentences}문장` },
      {
        label: "평균 속도",
        value: `${cpmValues.length ? Math.round(cpmValues.reduce((sum, value) => sum + value, 0) / cpmValues.length) : 0} 글자/분`,
      },
      {
        label: "평균 정답률",
        value: `${totalQuizTotal > 0 ? Math.round((totalQuizCorrect / totalQuizTotal) * 100) : 0}%`,
      },
    ];
  }, [last7Keys, readingLogs]);

  const cumulativeRadarData = useMemo(() => {
    const logsWithRadar = readingLogs.filter((log) => Boolean(log?.payload?.radarScores));
    if (logsWithRadar.length === 0) return [];

    const sum = { vocabulary: 0, understanding: 0, thinking: 0, expression: 0 };
    for (const log of logsWithRadar) {
      const r = log.payload.radarScores!;
      sum.vocabulary += Number(r.vocabulary ?? 0);
      sum.understanding += Number(r.understanding ?? 0);
      sum.thinking += Number(r.thinking ?? 0);
      sum.expression += Number(r.expression ?? 0);
    }
    const n = logsWithRadar.length;
    return [
      { subject: "어휘력", value: Math.round(sum.vocabulary / n), fullMark: 100 },
      { subject: "이해력", value: Math.round(sum.understanding / n), fullMark: 100 },
      { subject: "사고력", value: Math.round(sum.thinking / n), fullMark: 100 },
      { subject: "표현력", value: Math.round(sum.expression / n), fullMark: 100 },
    ];
  }, [readingLogs]);

  const coachingCards = useMemo(
    () => [
      {
        title: "잘하고 있는 점",
        items:
          feedback?.goodItems?.length > 0
            ? feedback.goodItems
            : ["꾸준히 학습을 이어가고 있어요."],
      },
      {
        title: "보완하면 좋은 점",
        items:
          feedback?.improveItems?.length > 0
            ? feedback.improveItems
            : ["문장별 핵심어 찾기를 연습해 봐요."],
      },
      {
        title: "다음 학습 미션",
        items: [buildMission(stats)],
      },
    ],
    [feedback, stats]
  );

  if (authStatus === "loading") {
    return <div className="py-8 font-pretendard" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="py-8 font-pretendard leading-relaxed">
        <section className="pt-0 pb-10 text-center border-b border-gray-100">
          <h2 className="mb-4 text-[22px] font-bold tracking-tight text-[#212529]">
            로그인이 필요합니다
          </h2>
          <p className="mb-6 text-[14px] text-gray-500">
            나의 성장 리포트를 확인하려면 먼저 로그인을 해주세요.
          </p>
          <button
            type="button"
            onClick={() => signIn()}
            className="inline-flex items-center justify-center rounded-xl bg-[#FF5C00] px-5 py-3 text-base font-bold text-white hover:opacity-90"
          >
            로그인하기
          </button>
        </section>
      </div>
    );
  }

  /* 로딩 중에는 빈 데이터 문구 대신 스켈레톤 표시 → "데이터가 없습니다" 깜빡임 제거 */
  if (loading) {
    return (
      <div className="py-8 font-pretendard leading-relaxed">
        <div className="space-y-12">
          <header className="mb-2">
            <h1 className="text-[28px] font-bold tracking-tight text-[#212529]">
              나의 성장 리포트
            </h1>
          </header>
          <MypageTabs />
          <GrowthSkeletonCard blocks={4} />
          <GrowthSkeletonCard blocks={3} />
          <GrowthSkeletonCard blocks={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 font-pretendard leading-relaxed">
      <div className="space-y-12">
        <header className="mb-2">
          <h1 className="text-[28px] font-bold tracking-tight text-[#212529]">
            나의 성장 리포트
          </h1>
        </header>

        <MypageTabs />

        {/* 종합 코칭: 읽기 습관 / 뱃지 / 한 줄 분석 */}
        <GrowthSectionCard title="분석 결과">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#FFF7ED] p-5 md:p-6 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm shrink-0">
                <Image
                  src="/images/character_wink.jpg"
                  alt="또독이 코치"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#FB923C] uppercase tracking-wide">
                  이번 주 읽기 분석
                </p>
                <p className="mt-1 text-lg font-extrabold text-[#212529]">
                  {learnerAnalysis}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rhythmCard?.value && (
                    <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#F97316] shadow-[0_0_0_1px_rgba(248,148,72,0.15)]">
                      읽기 리듬: {rhythmCard.value}
                    </span>
                  )}
                  {balanceCard?.value && (
                    <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#6366F1] shadow-[0_0_0_1px_rgba(129,140,248,0.15)]">
                      습관 균형 상태: {balanceCard.value}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {habitCards.map((card, index) => {
                const isRhythm = card.title === "읽기 리듬";
                const isComprehension = card.title === "이해도";
                const bgClass = isRhythm
                  ? "bg-[#FFF7ED]"
                  : isComprehension
                    ? "bg-[#EFF6FF]"
                    : "bg-[#F5F3FF]";
                const badgeColor =
                  isRhythm && card.value === "차근차근"
                    ? "bg-[#FEF3C7] text-[#EA580C]"
                    : card.value === "안정적" || card.value === "훌륭함" || card.value === "완벽 균형"
                      ? "bg-[#DCFCE7] text-[#15803D]"
                      : card.title === "읽기 습관 균형"
                        ? "bg-[#EDE9FE] text-[#6D28D9]"
                        : "bg-[#DBEAFE] text-[#1D4ED8]";

                return (
                  <div
                    key={`${card.title}-${index}`}
                    className={`rounded-2xl p-5 flex flex-col gap-3 ${bgClass}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#F97316] shadow-sm">
                          {isRhythm ? "🌊" : isComprehension ? "💡" : "⚖️"}
                        </span>
                        <p className="text-base font-semibold text-[#4B5563]">{card.title}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${badgeColor}`}
                      >
                        {card.value}
                      </span>
                    </div>
                    <p className="text-base leading-6 text-[#374151]">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </GrowthSectionCard>

        {/* 7일 학습 통계 차트 — 모바일에서 차트 가로폭 확대 */}
        <GrowthSectionCard title="나의 문해력 성장 곡선">
          {hasGrowthData ? (
            <div className="space-y-5 -mx-2 md:mx-0">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5]">
                  📈
                </span>
                <p className="text-base font-medium text-gray-700">
                  매일 조금씩 성장하는 리듬을 한눈에 볼 수 있습니다.
                </p>
              </div>
              <WeeklyBarChart
                key={weeklyData.join(",")}
                data={weeklyData}
                labels={stats?.last7DayLabels ?? EMPTY_DASHBOARD_STATS.last7DayLabels}
              />
              <SpeedAreaChart
                data={speedChartData}
                labels={stats?.last7DayLabels ?? EMPTY_DASHBOARD_STATS.last7DayLabels}
              />
            </div>
          ) : (
            <p className="text-base font-medium text-gray-500">아직 누적된 성장 기록이 없습니다.</p>
          )}
        </GrowthSectionCard>

        {/* 활동 요약 수치 */}
        <GrowthSectionCard title="활동 요약">
          {hasGrowthData ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {activitySummaryCards.map((card, index) => (
                <div
                  key={`${card.label}-${index}`}
                  className="flex flex-col gap-2 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#F97316] shadow-sm">
                      {card.label === "학습 일수" ? "📅" : card.label === "읽은 문장" ? "📖" : "⚡"}
                    </span>
                    <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  </div>
                  <p className="text-[32px] font-black text-orange-500">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base font-medium text-gray-500">활동 기록을 불러올 수 없습니다.</p>
          )}
        </GrowthSectionCard>

        {/* 문해 성장 프로필 + 학습 코칭 */}
        <div className="grid gap-4 lg:grid-cols-2">
          <GrowthSectionCard title="문해 성장 프로필">
            {hasGrowthData && cumulativeRadarData.length > 0 ? (
              <div className="p-4 md:p-6">
                <div className="h-[300px] md:h-[420px] w-full min-w-0 flex items-center justify-center overflow-visible">
                  {/* 모바일 300px */}
                  <div className="md:hidden flex items-center justify-center [&_.recharts-polar-angle-axis-tick]:relative [&_.recharts-polar-angle-axis-tick]:z-10">
                    <RadarChart
                      width={300}
                      height={300}
                      data={cumulativeRadarData}
                      margin={{ top: 56, right: 56, bottom: 56, left: 56 }}
                    >
                      <PolarGrid stroke="#FDE7D7" />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tickCount={6}
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      />
                      <Tooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0]?.payload as { subject?: string; value?: number };
                          return (
                            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                              <span className="text-xs font-semibold text-gray-500">{p?.subject}</span>
                              <span className="ml-2 text-sm font-bold text-[#212529]">{p?.value ?? 0}점</span>
                            </div>
                          );
                        }}
                      />
                      <Radar
                        dataKey="value"
                        stroke="#F97316"
                        fill="#FDBA74"
                        fillOpacity={0.35}
                        strokeWidth={2}
                        dot={{ r: 5, fill: "#F97316", stroke: "#fff", strokeWidth: 2 }}
                      />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={renderAngleAxisTick(150, 150, 94, 20, 12, 700)}
                      />
                    </RadarChart>
                  </div>
                  {/* PC·태블릿 420px */}
                  <div className="hidden md:flex items-center justify-center [&_.recharts-polar-angle-axis-tick]:relative [&_.recharts-polar-angle-axis-tick]:z-10">
                    <RadarChart
                      width={420}
                      height={420}
                      data={cumulativeRadarData}
                      margin={{ top: 72, right: 72, bottom: 72, left: 72 }}
                    >
                      <PolarGrid stroke="#FDE7D7" />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tickCount={6}
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      />
                      <Tooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0]?.payload as { subject?: string; value?: number };
                          return (
                            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                              <span className="text-xs font-semibold text-gray-500">{p?.subject}</span>
                              <span className="ml-2 text-sm font-bold text-[#212529]">{p?.value ?? 0}점</span>
                            </div>
                          );
                        }}
                      />
                      <Radar
                        dataKey="value"
                        stroke="#F97316"
                        fill="#FDBA74"
                        fillOpacity={0.35}
                        strokeWidth={2}
                        dot={{ r: 5, fill: "#F97316", stroke: "#fff", strokeWidth: 2 }}
                      />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={renderAngleAxisTick(210, 210, 138, 20, 13, 700)}
                      />
                    </RadarChart>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-base font-medium text-gray-500">
                문해 영역별 분석 결과가 없습니다. 첫 글을 읽고 결과를 확인해 보세요.
              </p>
            )}
          </GrowthSectionCard>

          <GrowthSectionCard title="학습 코칭">
            {hasGrowthData ? (
              <div className="grid gap-4">
                {coachingCards.map((card, index) => (
                  <div key={`${card.title}-${index}`} className="rounded-2xl bg-[#F9FAFB] p-5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#F97316] shadow-sm">
                        {card.title === "잘하고 있는 점" ? "✨" : "🛠️"}
                      </span>
                      <p className="text-base font-bold text-[#212529]">{card.title}</p>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {card.items.map((item, itemIndex) => (
                        <li
                          key={`${card.title}-${itemIndex}`}
                          className="flex gap-2 text-base leading-7 text-gray-700"
                        >
                          <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base font-medium text-gray-500">학습 코칭 데이터가 없습니다.</p>
            )}
          </GrowthSectionCard>
        </div>
      </div>
    </div>
  );
}