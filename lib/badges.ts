/**
 * 배지 데이터 상수 — 카테고리별 학습 동기 부여용 20개
 */

export type BadgeCondition =
  | "COUNT"
  | "STREAK"
  | "READ_COUNT"
  | "ACCURACY"
  | "CONTINUOUS"
  | "RETRY"
  | "WORD"
  | "SPEED"
  | "SPEED_MAINTAIN"
  | "WRITE"
  | "SCORE"
  | "ALL"
  | "LEVEL"
  | "SPECIAL";

export type BadgeCategory =
  | "habit"
  | "reading"
  | "quiz"
  | "speed"
  | "deep"
  | "special";

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  condition: BadgeCondition;
  target: number;
  category: BadgeCategory;
  icon: string;
  subIcon: string;
}

export const BADGE_LIST: BadgeItem[] = [
  // [출석 & 습관]
  {
    id: "first_login",
    name: "또독 입성",
    description: "첫 학습 완료",
    condition: "COUNT",
    target: 1,
    category: "habit",
    icon: "DoorOpen",
    subIcon: "Check",
  },
  {
    id: "streak_3",
    name: "작심삼일 격파",
    description: "3일 연속 학습",
    condition: "STREAK",
    target: 3,
    category: "habit",
    icon: "Calendar",
    subIcon: "Flame",
  },
  {
    id: "streak_7",
    name: "일주일의 기적",
    description: "7일 연속 학습",
    condition: "STREAK",
    target: 7,
    category: "habit",
    icon: "Calendar",
    subIcon: "Star",
  },
  {
    id: "streak_30",
    name: "성실의 화신",
    description: "30일 연속 학습",
    condition: "STREAK",
    target: 30,
    category: "habit",
    icon: "Trophy",
    subIcon: "Calendar",
  },
  {
    id: "weekend_warrior",
    name: "주말 열공",
    description: "주말 학습 달성",
    condition: "SPECIAL",
    target: 1,
    category: "habit",
    icon: "Heart",
    subIcon: "BookOpen",
  },

  // [다독 - 양적 성장]
  {
    id: "read_100",
    name: "문장 수집가",
    description: "누적 100문장 읽기",
    condition: "READ_COUNT",
    target: 100,
    category: "reading",
    icon: "Library",
    subIcon: "Plus",
  },
  {
    id: "read_500",
    name: "지식 탐험가",
    description: "누적 500문장 읽기",
    condition: "READ_COUNT",
    target: 500,
    category: "reading",
    icon: "Compass",
    subIcon: "Book",
  },
  {
    id: "read_1000",
    name: "문장의 바다",
    description: "누적 1000문장 읽기",
    condition: "READ_COUNT",
    target: 1000,
    category: "reading",
    icon: "Waves",
    subIcon: "BookOpen",
  },
  {
    id: "read_master",
    name: "도서관 관장",
    description: "누적 3000문장 읽기",
    condition: "READ_COUNT",
    target: 3000,
    category: "reading",
    icon: "Castle",
    subIcon: "Crown",
  },

  // [정독 & 퀴즈 - 질적 성장]
  {
    id: "quiz_100",
    name: "백점 만점",
    description: "퀴즈 정답률 100%",
    condition: "ACCURACY",
    target: 100,
    category: "quiz",
    icon: "Target",
    subIcon: "Zap",
  },
  {
    id: "quiz_perfect_5",
    name: "정답 스나이퍼",
    description: "5회 연속 정답률 90%",
    condition: "CONTINUOUS",
    target: 5,
    category: "quiz",
    icon: "Crosshair",
    subIcon: "Check",
  },
  {
    id: "wrong_answer_hero",
    name: "오답 사냥꾼",
    description: "오답 다시 풀기 성공",
    condition: "RETRY",
    target: 5,
    category: "quiz",
    icon: "Search",
    subIcon: "Ghost",
  },
  {
    id: "word_master",
    name: "어휘의 달인",
    description: "핵심 단어 문제 20회",
    condition: "WORD",
    target: 20,
    category: "quiz",
    icon: "Puzzle",
    subIcon: "Type",
  },

  // [속도 & 페이스]
  {
    id: "cpm_optimal",
    name: "꼼꼼한 독자",
    description: "적정 속도로 읽기",
    condition: "SPEED",
    target: 1,
    category: "speed",
    icon: "Timer",
    subIcon: "Check",
  },
  {
    id: "cpm_maintain",
    name: "완벽한 레이서",
    description: "5회 속도 유지",
    condition: "SPEED_MAINTAIN",
    target: 5,
    category: "speed",
    icon: "Flag",
    subIcon: "Timer",
  },

  // [심화 작성]
  {
    id: "step3_first",
    name: "생각의 시작",
    description: "3단계 첫 작성",
    condition: "WRITE",
    target: 1,
    category: "deep",
    icon: "PenLine",
    subIcon: "Lightbulb",
  },
  {
    id: "step3_ten",
    name: "꼬마 작가님",
    description: "3단계 10회 작성",
    condition: "WRITE",
    target: 10,
    category: "deep",
    icon: "Feather",
    subIcon: "Edit3",
  },
  {
    id: "step3_logic",
    name: "완벽한 논리",
    description: "4개 영역 90점 이상",
    condition: "SCORE",
    target: 90,
    category: "deep",
    icon: "Diamond",
    subIcon: "Pen",
  },

  // [종합]
  {
    id: "all_rounder",
    name: "팔방미인",
    description: "모든 분야 배지 1개",
    condition: "ALL",
    target: 1,
    category: "special",
    icon: "Medal",
    subIcon: "Sparkles",
  },
  {
    id: "growth_king",
    name: "성장 대장",
    description: "학습 레벨업 달성",
    condition: "LEVEL",
    target: 5,
    category: "special",
    icon: "ArrowUpCircle",
    subIcon: "Smile",
  },
];
