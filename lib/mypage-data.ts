/**
 * 마이페이지용 목업 데이터 (추후 API/상태 연동 시 교체)
 */

export interface MypageStats {
  nickname: string;
  /** 실시간 WPM 평균 (읽기 호흡 계산용) */
  averageWpm: number;
  /** 오늘의 정답률 0–100 */
  todayAccuracy: number;
  /** 누적 읽은 문장 수 */
  totalSentencesRead: number;
}

/** 주간 학습량 (요일별 읽은 문장 수) */
export const weeklyLearningData = [42, 68, 55, 80, 72, 90, 65];

/** 속도 변화 (일별 WPM, 최근 7일) */
export const speedHistoryData = [65, 72, 68, 78, 82, 75, 72];

export const defaultMypageStats: MypageStats = {
  nickname: "똑똑이",
  averageWpm: 72,
  todayAccuracy: 85,
  totalSentencesRead: 500,
};

/** 잘하고 있어요 항목 */
export const goodFeedbackItems = [
  "꼼꼼한 읽기 속도를 유지하고 있어요",
  "오늘도 꾸준히 학습했어요",
  "문장 이해도가 좋아지고 있어요",
];

/** 더 노력해봐요 항목 */
export const improveFeedbackItems = [
  "퀴즈 정답률을 90%까지 올려봐요",
  "매일 10분씩 읽기 습관을 이어가요",
];

/** 성취 배지 */
export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  color: "orange" | "gray";
}

export const achievementBadges: AchievementBadge[] = [
  {
    id: "sentences-100",
    title: "100문장 읽기",
    description: "누적 100문장 읽기 달성",
    icon: "📖",
    unlocked: true,
    color: "orange",
  },
  {
    id: "quiz-80",
    title: "퀴즈 80%",
    description: "정답률 80% 이상",
    icon: "✓",
    unlocked: true,
    color: "orange",
  },
  {
    id: "steady-reader",
    title: "꼼꼼한 독자",
    description: "적정 속도로 읽기",
    icon: "🐢",
    unlocked: true,
    color: "orange",
  },
  {
    id: "sentences-500",
    title: "500문장 읽기",
    description: "누적 500문장 읽기 달성",
    icon: "⭐",
    unlocked: true,
    color: "orange",
  },
  {
    id: "week-streak",
    title: "7일 연속",
    description: "7일 연속 학습",
    icon: "🔥",
    unlocked: false,
    color: "gray",
  },
];
