"use client";

import { useMemo, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import {
  achievementBadges as baseBadges,
  getFeedbackFromStats,
} from "@/lib/mypage-data";
import type { AchievementBadge } from "@/lib/mypage-data";
import { EMPTY_DASHBOARD_STATS, type ThinkingNoteItem } from "@/lib/study-log-types";
import { STUDY_LOGS_UPDATED_EVENT, useUserStatus } from "@/hooks/useUserStatus";
import MypageHeader from "@/components/mypage/MypageHeader";
import SummaryCards from "@/components/mypage/SummaryCards";
import SpeedChart from "@/components/mypage/SpeedChart";
import WeeklyBarChart from "@/components/mypage/WeeklyBarChart";
import SpeedAreaChart from "@/components/mypage/SpeedAreaChart";
import AchievementBadges from "@/components/mypage/AchievementBadges";
import AnalysisFeedback from "@/components/mypage/AnalysisFeedback";
import CharacterFeedback from "@/components/mypage/CharacterFeedback";
import ThinkingNotes from "@/components/mypage/ThinkingNotes";

/** 보유 배지 중 표시 순서상 마지막(가장 최근에 획득한 것으로 간주) 1개 반환 */
function getRepresentativeBadge(
  badges: AchievementBadge[]
): { icon: string; title: string } | null {
  const unlocked = badges.filter((b) => b.unlocked);
  if (unlocked.length === 0) return null;
  const last = unlocked[unlocked.length - 1];
  return { icon: last.icon, title: last.title };
}

function getBadgesWithUnlocked(stats: {
  totalSentencesRead: number;
  todayAccuracy: number;
  averageWpm: number;
  streakDays: number;
}): AchievementBadge[] {
  const { totalSentencesRead, todayAccuracy, averageWpm, streakDays } = stats;
  const hasNoData =
    totalSentencesRead === 0 &&
    todayAccuracy === 0 &&
    averageWpm === 0 &&
    streakDays === 0;

  if (hasNoData) {
    return baseBadges.map((b) => ({ ...b, unlocked: false }));
  }
  return baseBadges.map((badge) => {
    let unlocked = false;
    switch (badge.id) {
      case "sentences-100":
        unlocked = totalSentencesRead >= 100;
        break;
      case "quiz-80":
        unlocked = todayAccuracy >= 80;
        break;
      case "steady-reader":
        unlocked = averageWpm >= 301 && averageWpm <= 500 && averageWpm > 0;
        break;
      case "sentences-500":
        unlocked = totalSentencesRead >= 500;
        break;
      case "week-streak":
        unlocked = streakDays >= 7;
        break;
      default:
        unlocked = false;
    }
    return { ...badge, unlocked };
  });
}

export default function MypageDashboard() {
  const { isAuthenticated, authStatus, loadDashboardData } = useUserStatus();
  const [stats, setStats] = useState({
    ...EMPTY_DASHBOARD_STATS,
  });
  const [thinkingNotes, setThinkingNotes] = useState<ThinkingNoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const next = await loadDashboardData();
    setStats(next);
    setThinkingNotes(next.thinkingNotes ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void refresh();
  }, [isAuthenticated, loadDashboardData]);

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

  const badges = useMemo(() => getBadgesWithUnlocked(stats), [stats]);
  const representativeBadge = useMemo(
    () => getRepresentativeBadge(badges),
    [badges]
  );
  const feedback = useMemo(() => getFeedbackFromStats(stats), [stats]);
  const weeklyData = stats.weeklySentencesByDay ?? EMPTY_DASHBOARD_STATS.weeklySentencesByDay;
  const speedChartData = stats.weeklyWpmByDay ?? [];
  const hasNoData = !loading && !stats.hasAnyData;

  if (authStatus === "loading") {
    return <div className="py-8 font-pretendard" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="py-8 font-pretendard">
        <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
          <h2 className="text-xl font-extrabold text-[#212529] mb-3">로그인이 필요한 서비스입니다</h2>
          <p className="text-sm text-gray-500 leading-6 mb-6">
            마이페이지에서는 로그인한 계정의 학습 기록만 확인할 수 있어요.
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

  return (
    <div className="py-8 font-pretendard">
      <MypageHeader
        title="학습 분석 리포트"
        representativeBadge={representativeBadge}
      />

      {hasNoData && (
        <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
          <h2 className="text-xl font-extrabold text-[#212529] mb-3">아직 학습 기록이 없어요</h2>
          <p className="text-sm text-gray-500 leading-6">
            오늘의 학습이나 또독 읽기를 시작하면 성장 그래프와 사고력 노트가 여기에 쌓입니다.
          </p>
        </section>
      )}

      {!hasNoData && (
        <>
          <div className="mb-8">
            <CharacterFeedback totalSentencesRead={stats.totalSentencesRead} />
          </div>

          <div className="mb-10">
            <SummaryCards
              averageWpm={stats.averageWpm}
              todayAccuracy={stats.todayAccuracy}
              totalSentencesRead={stats.totalSentencesRead}
            />
          </div>

          <div className="mb-10">
            <SpeedChart averageCpm={stats.averageWpm} />
          </div>

          <div className="mb-10">
            <WeeklyBarChart
              key={weeklyData.join(",")}
              data={weeklyData}
              labels={stats.last7DayLabels}
            />
            <div className="mt-8">
              <SpeedAreaChart
                data={speedChartData}
                labels={stats.last7DayLabels}
              />
            </div>
          </div>

          <div className="mb-10">
            <ThinkingNotes notes={thinkingNotes} />
          </div>

          <div className="mb-10">
            <AchievementBadges badges={badges} />
          </div>

          <div className="mb-10">
            <AnalysisFeedback
              totalSentencesRead={stats.totalSentencesRead}
              todayAccuracy={stats.todayAccuracy}
              goodItems={feedback.goodItems}
              improveItems={feedback.improveItems}
            />
          </div>

          <p
            className="mt-8 text-center text-sm text-gray-500"
            role="status"
            aria-live="polite"
          >
            학습 기록은 로그인한 계정 기준으로 서버에 저장됩니다.
          </p>
        </>
      )}
    </div>
  );
}
