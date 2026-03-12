"use client";

import Link from "next/link";
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
import WeeklyBarChart from "@/components/mypage/WeeklyBarChart";
import SpeedAreaChart from "@/components/mypage/SpeedAreaChart";

function getDisplayName(name?: string | null, email?: string | null): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;

  const trimmedEmail = email?.trim();
  if (trimmedEmail) return trimmedEmail;

  return "학습자";
}

function buildLearnerOneLineAnalysis(
  displayName: string,
  averageWpm: number,
  accuracy: number
): string {
  const { tier } = getCPMTier(averageWpm);
  const accuracyLabel =
    accuracy >= 80 ? "이해를 잘 잡는" : accuracy >= 60 ? "꾸준히 성장하는" : "차근차근 다져가는";

  if (tier === "안정적") {
    return `${displayName}님은 안정적으로 읽으며 ${accuracyLabel} 학습자예요.`;
  }
  if (tier === "차근차근") {
    return `${displayName}님은 꼼꼼하게 읽으며 ${accuracyLabel} 학습자예요.`;
  }
  if (tier === "빠름") {
    return `${displayName}님은 빠른 흐름을 유지하며 ${accuracyLabel} 학습자예요.`;
  }
  return `${displayName}님은 집중력 있게 읽으며 ${accuracyLabel} 학습자예요.`;
}

function buildBalanceInsight(averageWpm: number, accuracy: number): {
  title: string;
  description: string;
} {
  const { tier } = getCPMTier(averageWpm);

  if (accuracy >= 80 && tier === "안정적") {
    return {
      title: "균형형",
      description: "속도와 이해의 균형이 좋아서 꾸준히 성장하기 좋은 리듬이에요.",
    };
  }
  if (accuracy >= 80 && tier === "차근차근") {
    return {
      title: "꼼꼼형",
      description: "천천히 읽더라도 중요한 내용을 단단하게 붙잡는 힘이 보여요.",
    };
  }
  if (accuracy < 60 && (tier === "빠름" || tier === "매우 빠름")) {
    return {
      title: "속도 조절형",
      description: "읽기 흐름은 좋아요. 핵심 문장을 한 번 더 떠올리면 균형이 더 좋아질 수 있어요.",
    };
  }

  return {
    title: "성장형",
    description: "읽기 습관이 쌓이는 중이에요. 지금의 흐름을 이어 가면 더 또렷한 균형이 만들어질 수 있어요.",
  };
}

function buildMission(stats: {
  streakDays: number;
  todayAccuracy: number;
  averageWpm: number;
  totalSentencesRead: number;
}): string {
  if (stats.streakDays < 3) {
    return "이번 주에는 3일 연속으로 문해 학습을 이어가 보세요.";
  }
  if (stats.todayAccuracy < 80) {
    return "다음 학습에서 퀴즈 정답률 80% 이상에 도전해 보세요.";
  }
  if (stats.averageWpm > 700) {
    return "빠른 흐름을 유지하되 핵심 문장을 한 번 더 떠올리며 읽어 보세요.";
  }
  if (stats.totalSentencesRead < 100) {
    return "이번 주에 누적 100문장 읽기에 도전해 보세요.";
  }
  return "문해 활동 한 편을 더 읽고 스스로의 생각까지 정리해 보세요.";
}

function GrowthSectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
      <div>
        <p className="text-[15px] font-semibold text-[#F97316]">{title}</p>
        {subtitle ? <h3 className="mt-1 text-xl font-extrabold text-[#212529]">{subtitle}</h3> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function GrowthSkeletonCard({ blocks = 3 }: { blocks?: number }) {
  return (
    <GrowthSectionCard title="분석 데이터를 불러오는 중입니다..." subtitle="나의 성장 리포트">
      <div className="animate-pulse space-y-3">
        {Array.from({ length: blocks }).map((_, index) => (
          <div key={index} className="h-20 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </GrowthSectionCard>
  );
}

export default function GrowthReportDashboard() {
  const { data: session } = useSession();
  const { isAuthenticated, authStatus, loadStudyLogs } = useUserStatus();
  const [stats, setStats] = useState({ ...EMPTY_DASHBOARD_STATS });
  const [readingLogs, setReadingLogs] = useState<StudyLogRecord<"reading_session">[]>([]);
  const [loading, setLoading] = useState(true);
  const emptyRetryRef = useRef(false);

  const refresh = async () => {
    setLoading(true);
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
    setLoading(false);
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
    const onStudyLogsUpdated = () => void refresh();
    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
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

  useEffect(() => {
    if (!isAuthenticated || loading || readingLogs.length > 0 || emptyRetryRef.current) return;

    emptyRetryRef.current = true;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 900);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, loading, readingLogs.length]);

  const displayName = getDisplayName(session?.user?.name, session?.user?.email);
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
          speedTier === "안정적"
            ? "속도와 집중의 흐름이 안정적으로 이어지고 있어요."
            : speedTier === "차근차근"
              ? "차분하게 읽으며 내용을 붙잡는 힘이 좋아요."
              : speedTier === "빠름"
                ? "읽기 흐름이 좋아요. 핵심 문장에 한 번 더 집중하면 더 좋아질 수 있어요."
                : "집중력은 좋아요. 핵심 내용을 한 번 더 확인하면 균형이 더 좋아질 수 있어요.",
      },
      {
        title: "이해도",
        value:
          (stats?.todayAccuracy ?? 0) >= 80
            ? "또렷함"
            : (stats?.todayAccuracy ?? 0) >= 60
              ? "안정 성장"
              : "차근차근",
        description:
          (stats?.todayAccuracy ?? 0) >= 80
            ? "문제를 풀 때 글의 핵심을 비교적 정확하게 잡아내고 있어요."
            : (stats?.todayAccuracy ?? 0) >= 60
              ? "전체 흐름을 따라가며 이해력을 차근차근 쌓고 있어요."
              : "핵심 문장을 다시 떠올리면 이해도가 더 좋아질 수 있어요.",
      },
      {
        title: "읽기 균형 해석",
        value: balanceInsight.title,
        description: balanceInsight.description,
      },
    ];
  }, [stats?.averageWpm, stats?.todayAccuracy]);
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
      { label: "학습일", value: `${learningDays}일` },
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
  const thinkingNotes = useMemo(() => stats?.thinkingNotes?.slice(0, 5) ?? [], [stats?.thinkingNotes]);
  const coachingCards = useMemo(
    () => [
      {
        title: "잘하고 있는 점",
        items:
          feedback?.goodItems?.length > 0
            ? feedback.goodItems
            : ["아직 기록이 없어요."],
      },
      {
        title: "보완할 점",
        items:
          feedback?.improveItems?.length > 0
            ? feedback.improveItems
            : ["아직 기록이 없어요."],
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
      <div className="py-8 font-pretendard">
        <section className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-3 text-xl font-extrabold text-[#212529]">로그인이 필요한 서비스입니다</h2>
          <p className="mb-6 text-sm leading-6 text-gray-500">
            나의 성장 리포트는 로그인한 계정의 학습 기록을 바탕으로 보여줘요.
          </p>
          <button
            type="button"
            onClick={() => signIn()}
            className="inline-flex items-center justify-center rounded-xl bg-[#FF5C00] px-5 py-3 text-sm font-bold text-white hover:opacity-90"
          >
            로그인하기
          </button>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8 font-pretendard">
        <div className="space-y-8">
          <header className="animate-pulse">
            <div className="h-5 w-28 rounded bg-gray-100" />
            <div className="mt-3 h-9 w-48 rounded bg-gray-100" />
          </header>
          <GrowthSkeletonCard blocks={2} />
          <GrowthSkeletonCard blocks={3} />
          <GrowthSkeletonCard blocks={4} />
          <GrowthSkeletonCard blocks={2} />
          <GrowthSkeletonCard blocks={3} />
          <GrowthSkeletonCard blocks={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 font-pretendard">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#212529]">나의 성장 리포트</h1>
        </header>

        {!hasGrowthData && (
          <section className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 md:p-8">
            <p className="text-lg font-bold text-[#212529]">또독과 함께 첫 읽기를 시작해 보세요!</p>
            <p className="mt-2 text-[15px] font-medium leading-7 text-gray-500">
              학습 기록이 쌓이면 성장 리포트가 이곳에 표시돼요.
            </p>
            <div className="mt-6">
              <Link
                href="/reading"
                className="inline-flex items-center justify-center rounded-full bg-[#F97316] px-5 py-3 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
              >
                학습하러 가기
              </Link>
            </div>
          </section>
        )}

        <GrowthSectionCard title="프로필" subtitle="학습자 한 줄 분석">
          {hasGrowthData ? (
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-[15px] font-semibold text-gray-500">프로필 요약</p>
              <p className="mt-2 text-lg font-bold text-[#212529]">{learnerAnalysis}</p>
            </div>
          ) : (
            <p className="text-[15px] font-medium text-gray-500">아직 기록이 없어요.</p>
          )}
        </GrowthSectionCard>

        <GrowthSectionCard title="습관 카드" subtitle="읽기 리듬과 이해도">
          {hasGrowthData ? (
            <div className="grid gap-4 md:grid-cols-3">
              {habitCards.map((card) => (
                <div key={card.title} className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-[#F97316]">{card.title}</p>
                  <p className="mt-3 text-xl font-extrabold text-[#212529]">{card.value}</p>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{card.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[15px] font-medium text-gray-500">아직 기록이 없어요.</p>
          )}
        </GrowthSectionCard>

        <GrowthSectionCard title="활동 요약" subtitle="최근 7일 누적 수치">
          {hasGrowthData ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {activitySummaryCards.map((card) => (
                <div key={card.label} className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-extrabold text-[#212529]">{card.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[15px] font-medium text-gray-500">아직 기록이 없어요.</p>
          )}
        </GrowthSectionCard>

        <GrowthSectionCard title="성장 곡선" subtitle="주간 학습량과 속도 변화">
          {hasGrowthData ? (
            <div className="space-y-6">
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
            <p className="text-[15px] font-medium text-gray-500">아직 기록이 없어요.</p>
          )}
        </GrowthSectionCard>

        <GrowthSectionCard title="사고력 노트" subtitle="최근 생각 기록">
          {hasGrowthData && thinkingNotes.length > 0 ? (
            <div className="space-y-3">
              {thinkingNotes.map((note, index) => (
                <article key={`${note?.kstDate ?? "note"}-${index}`} className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-[#F97316]">{note?.question ?? "질문이 없어요."}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#212529]">
                    {note?.userAnswer ?? "작성한 답안이 없어요."}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-[15px] font-medium text-gray-500">아직 기록이 없어요.</p>
          )}
        </GrowthSectionCard>

        <GrowthSectionCard title="학습 코칭" subtitle="다음 학습 방향 제안">
          {hasGrowthData ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {coachingCards.map((card) => (
                <div key={card.title} className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-base font-bold text-[#212529]">{card.title}</p>
                  <ul className="mt-3 space-y-2">
                    {card.items.map((item, index) => (
                      <li key={`${card.title}-${index}`} className="flex gap-2 text-sm leading-7 text-gray-700">
                        <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[15px] font-medium text-gray-500">아직 기록이 없어요.</p>
          )}
        </GrowthSectionCard>
      </div>
    </div>
  );
}
