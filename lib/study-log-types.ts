import type { QuizWordItem } from "@/lib/quiz-words-from-supabase";

export type StudyLogType = "daily_word_quiz" | "reading_session";
export type StudyLogStatus = "in_progress" | "completed";

export interface RadarScores {
  vocabulary: number;
  understanding: number;
  thinking: number;
  expression: number;
}

export interface ThinkingNoteItem {
  question: string;
  userAnswer: string;
  modelAnswer?: string;
  title?: string;
  kstDate?: string;
}

export interface DailyWordQuizPayload {
  quizItems: QuizWordItem[];
  step: number;
  answered: boolean | null;
  selectedWord: string | null;
  totalQuestions: number;
  completed: boolean;
}

export interface ReadingSessionPayload {
  title: string;
  source?: string;
  sentencesRead: number;
  quizCorrect: number;
  quizTotal: number;
  cpm: number;
  summaryFeedback?: string;
  thinkingFeedback?: string;
  radarScores?: RadarScores;
  thinkingNotes?: ThinkingNoteItem[];
  completed: boolean;
}

export interface StudyLogPayloadMap {
  daily_word_quiz: DailyWordQuizPayload;
  reading_session: ReadingSessionPayload;
}

export interface StudyLogRecord<T extends StudyLogType = StudyLogType> {
  id: string;
  userId?: string;
  logType: T;
  kstDate: string;
  status: StudyLogStatus;
  contentId?: string | null;
  contentType?: string | null;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  payload: StudyLogPayloadMap[T];
}

export interface DashboardStats {
  totalSentencesRead: number;
  todayAccuracy: number;
  averageWpm: number;
  streakDays: number;
  weeklySentencesByDay: number[];
  weeklyWpmByDay: number[];
  last7DayLabels: string[];
  thinkingNotes: ThinkingNoteItem[];
  hasAnyData: boolean;
}

export const EMPTY_DASHBOARD_STATS: DashboardStats = {
  totalSentencesRead: 0,
  todayAccuracy: 0,
  averageWpm: 0,
  streakDays: 0,
  weeklySentencesByDay: [0, 0, 0, 0, 0, 0, 0],
  weeklyWpmByDay: [0, 0, 0, 0, 0, 0, 0],
  last7DayLabels: [],
  thinkingNotes: [],
  hasAnyData: false,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatMonthDay(ymd: string): string {
  const [, month, day] = ymd.split("-");
  return `${month ?? ""}/${day ?? ""}`;
}

function getKstDateParts(baseDate = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(baseDate);

  const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
  const month = Number(parts.find((p) => p.type === "month")?.value ?? "1");
  const day = Number(parts.find((p) => p.type === "day")?.value ?? "1");
  return { year, month, day };
}

export function getKstDateKey(baseDate = new Date()): string {
  const { year, month, day } = getKstDateParts(baseDate);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getLast7KstDateKeys(baseDate = new Date()): string[] {
  const { year, month, day } = getKstDateParts(baseDate);
  const start = new Date(Date.UTC(year, month - 1, day));
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const date = String(d.getUTCDate()).padStart(2, "0");
    out.push(`${y}-${m}-${date}`);
  }
  return out;
}

/** 출석 체크용: 오늘 기준 [어제-3, 어제-2, 어제, 오늘, 내일] 5일 + 요일(월,화,수...) */
export interface AttendanceDayItem {
  dateKey: string;
  dayLabel: string;
  monthDay: string;
  isToday: boolean;
  isFuture: boolean;
}

export function getAttendanceWindow(baseDate = new Date()): AttendanceDayItem[] {
  const { year, month, day } = getKstDateParts(baseDate);
  const todayStart = new Date(Date.UTC(year, month - 1, day));
  const toKey = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${dayNum}`;
  };
  const toDayLabel = (d: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      weekday: "short",
    }).format(d);
  };
  const toMonthDay = (dateKey: string) => {
    const [, m, d] = dateKey.split("-");
    return `${Number(m)}/${Number(d)}`;
  };

  const todayKey = getKstDateKey(baseDate);
  const out: AttendanceDayItem[] = [];

  for (let offset = -3; offset <= 1; offset++) {
    const d = new Date(todayStart);
    d.setUTCDate(d.getUTCDate() + offset);
    const dateKey = toKey(d);
    out.push({
      dateKey,
      dayLabel: toDayLabel(d),
      monthDay: toMonthDay(dateKey),
      isToday: dateKey === todayKey,
      isFuture: offset > 0,
    });
  }
  return out;
}

export function buildStudyLogId(input: {
  userId?: string;
  logType: StudyLogType;
  kstDate: string;
  contentId?: string | null;
}): string {
  const scope = input.userId ?? "guest";
  const target = input.contentId ?? "daily";
  return `${scope}:${input.logType}:${target}:${input.kstDate}`;
}

export function normalizeStudyLogRecord(raw: unknown): StudyLogRecord | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.logType !== "string" || typeof raw.kstDate !== "string") {
    return null;
  }
  if (!isPlainObject(raw.payload)) return null;
  return {
    id: raw.id,
    userId: typeof raw.userId === "string" ? raw.userId : undefined,
    logType: raw.logType as StudyLogType,
    kstDate: raw.kstDate,
    status: raw.status === "completed" ? "completed" : "in_progress",
    contentId: typeof raw.contentId === "string" ? raw.contentId : null,
    contentType: typeof raw.contentType === "string" ? raw.contentType : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : null,
    payload: raw.payload as unknown as StudyLogPayloadMap[StudyLogType],
  };
}

export function normalizeStudyLogRecords(raw: unknown): StudyLogRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeStudyLogRecord(item))
    .filter((item): item is StudyLogRecord => item !== null);
}

export function aggregateDashboardStatsFromLogs(logs: StudyLogRecord[]): DashboardStats {
  if (!logs.length) return { ...EMPTY_DASHBOARD_STATS, last7DayLabels: getLast7KstDateKeys().map(formatMonthDay) };

  const readingLogs = logs.filter(
    (log): log is StudyLogRecord<"reading_session"> => log.logType === "reading_session"
  );

  const totalSentencesRead = readingLogs.reduce(
    (sum, log) => sum + safeNumber(log.payload.sentencesRead, 0),
    0
  );
  const totalQuizCorrect = readingLogs.reduce(
    (sum, log) => sum + safeNumber(log.payload.quizCorrect, 0),
    0
  );
  const totalQuizTotal = readingLogs.reduce(
    (sum, log) => sum + safeNumber(log.payload.quizTotal, 0),
    0
  );
  const todayAccuracy =
    totalQuizTotal > 0 ? Math.round((totalQuizCorrect / totalQuizTotal) * 100) : 0;

  const cpmValues = readingLogs
    .map((log) => safeNumber(log.payload.cpm, 0))
    .filter((value) => value > 0);
  const averageWpm =
    cpmValues.length > 0
      ? Math.round(cpmValues.reduce((sum, value) => sum + value, 0) / cpmValues.length)
      : 0;

  const last7Days = getLast7KstDateKeys();
  const weeklySentencesByDay = last7Days.map((day) =>
    readingLogs
      .filter((log) => log.kstDate === day)
      .reduce((sum, log) => sum + safeNumber(log.payload.sentencesRead, 0), 0)
  );

  const weeklyWpmByDay = last7Days.map((day) => {
    const values = readingLogs
      .filter((log) => log.kstDate === day)
      .map((log) => safeNumber(log.payload.cpm, 0))
      .filter((value) => value > 0);
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  });

  const dateSet = Array.from(
    new Set(
      logs
        .filter((log) => log.status === "completed")
        .map((log) => log.kstDate)
        .filter(Boolean)
    )
  ).sort();
  const todayKey = getKstDateKey();
  let streakDays = 0;
  if (dateSet.length > 0 && dateSet[dateSet.length - 1] === todayKey) {
    streakDays = 1;
    for (let i = dateSet.length - 2; i >= 0; i--) {
      const current = new Date(`${dateSet[i]}T00:00:00`);
      const next = new Date(`${dateSet[i + 1]}T00:00:00`);
      const diff = (next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streakDays += 1;
      else break;
    }
  }

  const thinkingNotes = readingLogs
    .flatMap((log) =>
      (log.payload.thinkingNotes ?? []).map((item) => ({
        ...item,
        title: item.title ?? log.payload.title,
        kstDate: item.kstDate ?? log.kstDate,
      }))
    )
    .filter((item) => item.userAnswer?.trim())
    .slice(-6)
    .reverse();

  return {
    totalSentencesRead,
    todayAccuracy,
    averageWpm,
    streakDays,
    weeklySentencesByDay,
    weeklyWpmByDay,
    last7DayLabels: last7Days.map(formatMonthDay),
    thinkingNotes,
    hasAnyData: logs.length > 0 || totalSentencesRead > 0,
  };
}
