import { useMemo } from "react";
import { BADGE_LIST, type BadgeItem } from "@/lib/badges";

export interface UserStats {
  /** 연속 학습 일수 */
  currentStreak: number;
  /** 누적 읽은 문장 수 */
  totalSentences: number;
  /** 최근 퀴즈 정답률 0–100 */
  lastQuizScore?: number;
  /** 적정 속도(CPM) 여부 */
  isOptimalSpeed?: boolean;
  /** 연속 정답률 90% 이상 횟수 (quiz_perfect_5용) */
  continuousHighAccuracyCount?: number;
  /** 오답 재도전 성공 횟수 (wrong_answer_hero용) */
  retrySuccessCount?: number;
  /** 핵심 단어 문제 풀이 횟수 (word_master용) */
  wordQuizCount?: number;
  /** 속도 유지 횟수 (cpm_maintain용) */
  speedMaintainCount?: number;
  /** 3단계(심화) 작성 횟수 (step3_first, step3_ten용) */
  step3WriteCount?: number;
  /** 4개 영역 점수 (step3_logic용, 영역별 0–100) */
  domainScores?: number[];
  /** 학습 완료(첫 로그인/첫 학습) 횟수 (first_login용) */
  completedSessionCount?: number;
  /** 주말 학습 여부 (weekend_warrior용) */
  hasWeekendStudy?: boolean;
  /** 학습 레벨 (growth_king용) */
  level?: number;
}

/**
 * 학습 종료 후 새로 달성한 배지만 필터해 반환 (이미 획득한 ID 제외)
 */
export function checkNewBadges(
  userStats: UserStats,
  earnedBadgeIds: string[]
): BadgeItem[] {
  return BADGE_LIST.filter((badge) => {
    if (earnedBadgeIds.includes(badge.id)) return false;

    switch (badge.condition) {
      case "COUNT":
        return (userStats.completedSessionCount ?? 0) >= badge.target;
      case "STREAK":
        return userStats.currentStreak >= badge.target;
      case "READ_COUNT":
        return userStats.totalSentences >= badge.target;
      case "ACCURACY":
        return (userStats.lastQuizScore ?? 0) >= badge.target;
      case "CONTINUOUS":
        return (userStats.continuousHighAccuracyCount ?? 0) >= badge.target;
      case "RETRY":
        return (userStats.retrySuccessCount ?? 0) >= badge.target;
      case "WORD":
        return (userStats.wordQuizCount ?? 0) >= badge.target;
      case "SPEED":
        return userStats.isOptimalSpeed === true;
      case "SPEED_MAINTAIN":
        return (userStats.speedMaintainCount ?? 0) >= badge.target;
      case "WRITE":
        return (userStats.step3WriteCount ?? 0) >= badge.target;
      case "SCORE": {
        const scores = userStats.domainScores ?? [];
        const allAbove =
          scores.length >= 4 && scores.every((s) => s >= badge.target);
        return allAbove;
      }
      case "ALL":
        // 모든 분야에서 배지 1개 이상: earnedBadgeIds에서 카테고리별로 1개씩 있는지 (habit, reading, quiz, speed, deep 제외 special)
        const byCategory = new Set(
          BADGE_LIST.filter((b) => earnedBadgeIds.includes(b.id)).map(
            (b) => b.category
          )
        );
        return ["habit", "reading", "quiz", "speed", "deep"].every((c) =>
          byCategory.has(c)
        );
      case "LEVEL":
        return (userStats.level ?? 0) >= badge.target;
      case "SPECIAL":
        if (badge.id === "weekend_warrior") {
          return userStats.hasWeekendStudy === true;
        }
        return false;
      default:
        return false;
    }
  });
}

/**
 * 현재 통계 기준으로 각 배지의 획득 여부 계산 (마이페이지 표시용)
 */
export function getBadgesWithUnlocked(
  userStats: UserStats,
  earnedBadgeIds: string[] = []
): (BadgeItem & { unlocked: boolean })[] {
  const earnedSet = new Set(earnedBadgeIds);
  return BADGE_LIST.map((badge) => {
    let unlocked = earnedSet.has(badge.id);
    if (!unlocked) {
      switch (badge.condition) {
        case "COUNT":
          unlocked = (userStats.completedSessionCount ?? 0) >= badge.target;
          break;
        case "STREAK":
          unlocked = userStats.currentStreak >= badge.target;
          break;
        case "READ_COUNT":
          unlocked = userStats.totalSentences >= badge.target;
          break;
        case "ACCURACY":
          unlocked = (userStats.lastQuizScore ?? 0) >= badge.target;
          break;
        case "CONTINUOUS":
          unlocked =
            (userStats.continuousHighAccuracyCount ?? 0) >= badge.target;
          break;
        case "RETRY":
          unlocked = (userStats.retrySuccessCount ?? 0) >= badge.target;
          break;
        case "WORD":
          unlocked = (userStats.wordQuizCount ?? 0) >= badge.target;
          break;
        case "SPEED":
          unlocked = userStats.isOptimalSpeed === true;
          break;
        case "SPEED_MAINTAIN":
          unlocked = (userStats.speedMaintainCount ?? 0) >= badge.target;
          break;
        case "WRITE":
          unlocked = (userStats.step3WriteCount ?? 0) >= badge.target;
          break;
        case "SCORE": {
          const scores = userStats.domainScores ?? [];
          unlocked =
            scores.length >= 4 &&
            scores.every((s) => s >= badge.target);
          break;
        }
        case "LEVEL":
          unlocked = (userStats.level ?? 0) >= badge.target;
          break;
        case "SPECIAL":
          if (badge.id === "weekend_warrior") {
            unlocked = userStats.hasWeekendStudy === true;
          }
          break;
        case "ALL":
          unlocked = false;
          break;
        default:
          unlocked = false;
      }
    }
    return { ...badge, unlocked };
  });
}

/**
 * 대시보드 통계(study-log 기반)를 UserStats 형태로 변환해 배지 체크에 사용
 */
export function useBadgeManager(stats: {
  totalSentencesRead: number;
  todayAccuracy: number;
  averageWpm: number;
  streakDays: number;
  completedSessionCount?: number;
}) {
  const userStats: UserStats = useMemo(
    () => ({
      currentStreak: stats.streakDays,
      totalSentences: stats.totalSentencesRead,
      lastQuizScore: stats.todayAccuracy,
      isOptimalSpeed:
        stats.averageWpm >= 301 &&
        stats.averageWpm <= 500 &&
        stats.averageWpm > 0,
      completedSessionCount: stats.completedSessionCount ?? (stats.totalSentencesRead > 0 ? 1 : 0),
    }),
    [
      stats.streakDays,
      stats.totalSentencesRead,
      stats.todayAccuracy,
      stats.averageWpm,
      stats.completedSessionCount,
    ]
  );

  return {
    userStats,
    checkNewBadges: (earnedBadgeIds: string[]) =>
      checkNewBadges(userStats, earnedBadgeIds),
    getBadgesWithUnlocked: (earnedBadgeIds: string[] = []) =>
      getBadgesWithUnlocked(userStats, earnedBadgeIds),
  };
}
