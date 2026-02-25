import {
  defaultMypageStats,
  weeklyLearningData,
  speedHistoryData,
  goodFeedbackItems,
  improveFeedbackItems,
  achievementBadges,
} from "@/lib/mypage-data";
import MypageHeader from "@/components/mypage/MypageHeader";
import SummaryCards from "@/components/mypage/SummaryCards";
import SpeedChart from "@/components/mypage/SpeedChart";
import WeeklyBarChart from "@/components/mypage/WeeklyBarChart";
import SpeedAreaChart from "@/components/mypage/SpeedAreaChart";
import AchievementBadges from "@/components/mypage/AchievementBadges";
import AnalysisFeedback from "@/components/mypage/AnalysisFeedback";
import CharacterFeedback from "@/components/mypage/CharacterFeedback";

export default function MypagePage() {
  const stats = defaultMypageStats;

  return (
    <div className="py-8 font-pretendard">
      <MypageHeader title="학습 분석 리포트" nickname={stats.nickname} />

      <SummaryCards
        averageWpm={stats.averageWpm}
        todayAccuracy={stats.todayAccuracy}
        totalSentencesRead={stats.totalSentencesRead}
      />

      <SpeedChart averageWpm={stats.averageWpm} />

      <WeeklyBarChart data={weeklyLearningData} />
      <SpeedAreaChart data={speedHistoryData} />

      <AchievementBadges badges={achievementBadges} />

      <AnalysisFeedback
        goodItems={goodFeedbackItems}
        improveItems={improveFeedbackItems}
      />

      <CharacterFeedback totalSentencesRead={stats.totalSentencesRead} />
    </div>
  );
}
