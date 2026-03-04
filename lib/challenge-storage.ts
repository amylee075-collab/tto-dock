/**
 * 비회원 1주일 단기 챌린지 - localStorage 기반 데이터 트래킹
 * 동일 브라우저(같은 origin)에서만 유지되며, 시크릿/다른 브라우저는 별도 인스턴스
 * 마이페이지와 동일한 키(ttodock_weekly_challenge)로 통일
 */

export const CHALLENGE_STORAGE_KEY = "ttodock_weekly_challenge";
const STORAGE_KEY = CHALLENGE_STORAGE_KEY;
const TTL_MS = 168 * 60 * 60 * 1000; // 7일 = 168시간

const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
/** 같은 탭에서 저장 시 마이페이지가 즉시 갱신하도록 사용 */
export const CHALLENGE_UPDATED_EVENT = "ttodock_challenge_updated";

/** 요일별 문장 수. 인덱스 0=월 ~ 6=일 (그래프 X축과 동일) */
const WEEKLY_EMPTY: [number, number, number, number, number, number, number] = [
  0, 0, 0, 0, 0, 0, 0,
];

export interface ChallengeData {
  /** 생성 시점 (ms). TTL 계산용 */
  createdAt: number;
  /** 누적 읽은 문장 수 */
  totalSentencesRead: number;
  /** 퀴즈 정답 수 누적 */
  quizCorrect: number;
  /** 퀴즈 전체 문제 수 누적 */
  quizTotal: number;
  /** 마지막 기록된 CPM(글자/분). 저장 키는 호환용 lastWpm 유지 */
  lastWpm: number;
  /** 연속 학습 일수 */
  streakDays: number;
  /** 마지막 활동일 YYYY-MM-DD */
  lastActivityDate: string | null;
  /** 요일별 읽은 문장 수 [월,화,수,목,금,토,일]. 그래프 X축 인덱스와 일치 */
  weeklySentencesByDay: number[];
  /** 요일별 CPM(글자/분) [월~일]. 속도 변화 그래프용, 리셋 시 전부 0 */
  weeklyWpmByDay: number[];
  /** 날짜(YYYY-MM-DD)별 기록. 최근 7일 X축 매칭용 */
  dailyStats?: Record<string, { sentences: number; wpm: number }>;
}

const defaultData = (): ChallengeData => ({
  createdAt: Date.now(),
  totalSentencesRead: 0,
  quizCorrect: 0,
  quizTotal: 0,
  lastWpm: 0,
  streakDays: 0,
  lastActivityDate: null,
  weeklySentencesByDay: [...WEEKLY_EMPTY],
  weeklyWpmByDay: [...WEEKLY_EMPTY],
  dailyStats: {},
});

/** new Date().getDay() → 그래프 인덱스 (0=월 ~ 6=일) */
function getDayIndex(): number {
  const d = new Date();
  const jsDay = d.getDay();
  return (jsDay + 6) % 7;
}

function ensureWeeklyArray(arr: unknown): number[] {
  if (Array.isArray(arr) && arr.length === 7) {
    return arr.map((v) => (Number.isFinite(Number(v)) ? Number(v) : 0));
  }
  return [...WEEKLY_EMPTY];
}

function safeNum(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseData(raw: string | null): ChallengeData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && "createdAt" in parsed) {
      const p = parsed as Record<string, unknown>;
      const createdAt = safeNum(p.createdAt, Date.now());
      return {
        createdAt,
        totalSentencesRead: safeNum(p.totalSentencesRead, 0),
        quizCorrect: safeNum(p.quizCorrect, 0),
        quizTotal: safeNum(p.quizTotal, 0),
        lastWpm: safeNum(p.lastWpm, 0),
        streakDays: safeNum(p.streakDays, 0),
        lastActivityDate: typeof p.lastActivityDate === "string" ? p.lastActivityDate : null,
        weeklySentencesByDay: ensureWeeklyArray(p.weeklySentencesByDay),
        weeklyWpmByDay: ensureWeeklyArray(p.weeklyWpmByDay),
        dailyStats: ensureDailyStats(p.dailyStats),
      };
    }
  } catch {
    // ignore
  }
  return null;
}

/** 생성 시점부터 168시간(7일) 경과 시 true */
function isExpired(data: ChallengeData): boolean {
  return Date.now() - data.createdAt >= TTL_MS;
}

/** localStorage 읽기 + TTL 체크. 만료 시 삭제 후 null 반환 */
function readRaw(): ChallengeData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  const data = parseData(raw);
  if (isDev && raw !== null) {
    console.log("[ttodock] challenge-storage LOAD", { key: STORAGE_KEY, raw: raw.slice(0, 120), parsed: data });
  }
  if (!data) return null;
  if (isExpired(data)) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return data;
}

/** 현재 챌린지 데이터 조회. 없거나 만료 시 초기값 반환(저장은 안 함) */
export function getChallengeData(): ChallengeData {
  const data = readRaw();
  return data ?? defaultData();
}

/** 초기값으로 리셋 후 저장 */
function resetAndSave(): ChallengeData {
  const fresh = defaultData();
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }
  return fresh;
}

/** 만료 시 리셋, 아니면 기존 데이터 반환. 앱 로드 시 한 번 호출 권장 */
export function ensureChallengeData(): ChallengeData {
  if (typeof window === "undefined") return defaultData();
  const data = readRaw();
  if (!data) return resetAndSave();
  return data;
}

function write(data: ChallengeData): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, payload);
  if (isDev) {
    console.log("[ttodock] challenge-storage SAVE", {
      key: STORAGE_KEY,
      totalSentencesRead: data.totalSentencesRead,
      quizCorrect: data.quizCorrect,
      quizTotal: data.quizTotal,
      lastWpm: data.lastWpm,
      streakDays: data.streakDays,
    });
  }
  try {
    window.dispatchEvent(new Event(CHALLENGE_UPDATED_EVENT));
  } catch {
    // ignore
  }
}

/** 읽기 완료: 문장 수 누적 + 오늘 요일·날짜별 기록 + 활동일/연속일 갱신 */
export function addReadingResult(sentencesRead: number): void {
  const data = readRaw();
  const next = data ? { ...data } : defaultData();
  next.weeklySentencesByDay = ensureWeeklyArray(next.weeklySentencesByDay);
  next.dailyStats = next.dailyStats ?? {};
  const today = getToday();
  if (isExpired(next)) {
    const fresh = defaultData();
    fresh.totalSentencesRead = sentencesRead;
    fresh.lastActivityDate = today;
    fresh.streakDays = 1;
    const dayIdx = getDayIndex();
    fresh.weeklySentencesByDay[dayIdx] = sentencesRead;
    fresh.dailyStats = { [today]: { sentences: sentencesRead, wpm: 0 } };
    write(fresh);
    return;
  }
  next.totalSentencesRead += sentencesRead;
  const dayIdx = getDayIndex();
  next.weeklySentencesByDay[dayIdx] = (next.weeklySentencesByDay[dayIdx] ?? 0) + sentencesRead;
  if (!next.dailyStats[today]) next.dailyStats[today] = { sentences: 0, wpm: 0 };
  next.dailyStats[today].sentences += sentencesRead;
  if (next.lastActivityDate !== today) {
    const prev = next.lastActivityDate;
    next.lastActivityDate = today;
    if (!prev) next.streakDays = 1;
    else if (isYesterday(prev)) next.streakDays += 1;
    else next.streakDays = 1;
  }
  write(next);
}

/** 퀴즈 완료: 정답/전체 누적 + 오늘 요일·날짜별 CPM 기록 + 활동일/연속일 갱신 */
export function addQuizResult(correct: number, total: number, cpm: number): void {
  const data = readRaw();
  const next = data ? { ...data } : defaultData();
  next.weeklySentencesByDay = ensureWeeklyArray(next.weeklySentencesByDay);
  next.weeklyWpmByDay = ensureWeeklyArray(next.weeklyWpmByDay);
  next.dailyStats = next.dailyStats ?? {};
  const today = getToday();
  if (isExpired(next)) {
    const fresh = defaultData();
    fresh.quizCorrect = correct;
    fresh.quizTotal = total;
    fresh.lastWpm = cpm;
    fresh.lastActivityDate = today;
    fresh.streakDays = 1;
    const dayIdx = getDayIndex();
    fresh.weeklyWpmByDay[dayIdx] = cpm;
    fresh.dailyStats = { [today]: { sentences: 0, wpm: cpm } };
    write(fresh);
    return;
  }
  next.quizCorrect += correct;
  next.quizTotal += total;
  next.lastWpm = cpm;
  const dayIdx = getDayIndex();
  next.weeklyWpmByDay[dayIdx] = cpm;
  if (!next.dailyStats[today]) next.dailyStats[today] = { sentences: 0, wpm: 0 };
  next.dailyStats[today].wpm = cpm;
  if (next.lastActivityDate !== today) {
    const prev = next.lastActivityDate;
    next.lastActivityDate = today;
    if (!prev) next.streakDays = 1;
    else if (isYesterday(prev)) next.streakDays += 1;
    else next.streakDays = 1;
  }
  write(next);
}

/** 로컬 기준 오늘 날짜 YYYY-MM-DD (저장·그래프 매칭 통일) */
function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isYesterday(ymd: string): boolean {
  const [y, m, day] = ymd.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, (day ?? 0) + 1);
  const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return next === getToday();
}

/** 오늘부터 앞으로 7일 [오늘, 내일, ..., +6일] 로컬 YYYY-MM-DD. 목표 달성형 그래프 X축용 */
function getNext7Days(): string[] {
  const today = new Date();
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}

/** YYYY-MM-DD → 요일 인덱스 0=월..6=일 (그래프 폴백용) */
function getDayIndexForYmd(ymd: string): number {
  const [y, m, day] = ymd.split("-").map(Number);
  const d = new Date(y ?? 0, (m ?? 1) - 1, day ?? 0);
  return (d.getDay() + 6) % 7;
}

/** YYYY-MM-DD → MM/DD (초등학생 가독성용, 연도 생략) */
function formatMonthDay(ymd: string): string {
  const [, m, d] = ymd.split("-");
  return `${m ?? ""}/${d ?? ""}`;
}

function ensureDailyStats(
  raw: unknown
): Record<string, { sentences: number; wpm: number }> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, { sentences: number; wpm: number }> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === "object" && val !== null && "sentences" in val && "wpm" in val) {
      const v = val as { sentences: unknown; wpm: unknown };
      out[key] = {
        sentences: safeNum(v.sentences, 0),
        wpm: safeNum(v.wpm, 0),
      };
    }
  }
  return out;
}

/** 마이페이지용: 정답률 0–100, 오늘부터 앞으로 7일(목표 달성형) 문장 수·CPM(글자/분)·X축 라벨. 미래일은 0. NaN 방지 */
export function getChallengeStatsForMypage(): {
  totalSentencesRead: number;
  todayAccuracy: number;
  averageWpm: number;
  streakDays: number;
  weeklySentencesByDay: number[];
  weeklyWpmByDay: number[];
  last7DayLabels: string[];
} {
  const data = ensureChallengeData();
  const total = Number.isFinite(data.quizTotal) ? data.quizTotal : 0;
  const correct = Number.isFinite(data.quizCorrect) ? data.quizCorrect : 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const next7 = getNext7Days();
  const daily = data.dailyStats ?? {};
  const wpmByDay = ensureWeeklyArray(data.weeklyWpmByDay);
  let weeklySentencesByDay = next7.map((d) => daily[d]?.sentences ?? 0);
  const totalSentencesRead = Number.isFinite(data.totalSentencesRead) ? data.totalSentencesRead : 0;
  let sumWeekly = weeklySentencesByDay.reduce((a, b) => a + b, 0);
  if (sumWeekly < totalSentencesRead && totalSentencesRead > 0) {
    weeklySentencesByDay = [...weeklySentencesByDay];
    weeklySentencesByDay[0] = (weeklySentencesByDay[0] ?? 0) + (totalSentencesRead - sumWeekly);
  }
  let weeklyWpmByDay = next7.map((d) => {
    const fromDaily = daily[d]?.wpm;
    if (fromDaily !== undefined && fromDaily !== null) return fromDaily;
    return wpmByDay[getDayIndexForYmd(d)] ?? 0;
  });
  const lastWpm = Number.isFinite(data.lastWpm) ? data.lastWpm : 0;
  if (weeklyWpmByDay[0] === 0 && lastWpm > 0) {
    weeklyWpmByDay = [...weeklyWpmByDay];
    weeklyWpmByDay[0] = lastWpm;
  }
  const last7DayLabels = next7.map(formatMonthDay);
  const result = {
    totalSentencesRead,
    todayAccuracy: Number.isFinite(accuracy) ? accuracy : 0,
    averageWpm: Number.isFinite(data.lastWpm) ? data.lastWpm : 0,
    streakDays: Number.isFinite(data.streakDays) ? data.streakDays : 0,
    weeklySentencesByDay,
    weeklyWpmByDay,
    last7DayLabels,
  };
  if (isDev && typeof window !== "undefined") {
    console.log("[ttodock] challenge-storage MYPAGE stats", result);
  }
  return result;
}
