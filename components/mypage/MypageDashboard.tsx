"use client";

import { useMemo, useEffect, useState } from "react";
import {
  getChallengeStatsForMypage,
  ensureChallengeData,
  CHALLENGE_STORAGE_KEY,
  CHALLENGE_UPDATED_EVENT,
} from "@/lib/challenge-storage";
import {
  achievementBadges as baseBadges,
  getFeedbackFromStats,
} from "@/lib/mypage-data";
import type { AchievementBadge } from "@/lib/mypage-data";
import MypageHeader from "@/components/mypage/MypageHeader";
import SummaryCards from "@/components/mypage/SummaryCards";
import SpeedChart from "@/components/mypage/SpeedChart";
import WeeklyBarChart from "@/components/mypage/WeeklyBarChart";
import SpeedAreaChart from "@/components/mypage/SpeedAreaChart";
import AchievementBadges from "@/components/mypage/AchievementBadges";
import AnalysisFeedback from "@/components/mypage/AnalysisFeedback";
import CharacterFeedback from "@/components/mypage/CharacterFeedback";

const EMPTY_WEEKLY = [0, 0, 0, 0, 0, 0, 0];

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
  const [stats, setStats] = useState({
    totalSentencesRead: 0,
    todayAccuracy: 0,
    averageWpm: 0,
    streakDays: 0,
    weeklySentencesByDay: EMPTY_WEEKLY,
    weeklyWpmByDay: [] as number[],
    last7DayLabels: [] as string[],
  });

  const refresh = () => {
    ensureChallengeData();
    const next = getChallengeStatsForMypage();
    setStats({
      ...next,
      weeklySentencesByDay: next.weeklySentencesByDay ?? EMPTY_WEEKLY,
      weeklyWpmByDay: next.weeklyWpmByDay ?? [],
      last7DayLabels: next.last7DayLabels ?? [],
    });
    if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
      console.log("[ttodock] mypage refresh", { key: CHALLENGE_STORAGE_KEY, stats: next });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CHALLENGE_STORAGE_KEY) refresh();
    };
    const onChallengeUpdated = () => refresh();
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(CHALLENGE_UPDATED_EVENT, onChallengeUpdated);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CHALLENGE_UPDATED_EVENT, onChallengeUpdated);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const badges = useMemo(() => getBadgesWithUnlocked(stats), [stats]);
  const representativeBadge = useMemo(
    () => getRepresentativeBadge(badges),
    [badges]
  );
  const feedback = useMemo(() => getFeedbackFromStats(stats), [stats]);
  const weeklyData = stats.weeklySentencesByDay ?? EMPTY_WEEKLY;
  const speedChartData = stats.weeklyWpmByDay ?? [];

  return (
    <div className="py-8 font-pretendard">
      <MypageHeader
        title="학습 분석 리포트"
        representativeBadge={representativeBadge}
      />

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
        이 기록은 현재 브라우저에서 7일간 유지됩니다.
      </p>
    </div>
  );
}
