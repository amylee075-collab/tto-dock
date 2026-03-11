"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  aggregateDashboardStatsFromLogs,
  buildStudyLogId,
  EMPTY_DASHBOARD_STATS,
  getKstDateKey,
  normalizeStudyLogRecords,
  type DashboardStats,
  type DailyWordQuizPayload,
  type ReadingSessionPayload,
  type StudyLogPayloadMap,
  type StudyLogRecord,
  type StudyLogType,
} from "@/lib/study-log-types";

export const STUDY_LOGS_UPDATED_EVENT = "ttodock_study_logs_updated";

type SaveInput<T extends StudyLogType> = {
  logType: T;
  payload: T extends "daily_word_quiz" ? DailyWordQuizPayload : ReadingSessionPayload;
  status?: "in_progress" | "completed";
  kstDate?: string;
  contentId?: string | null;
  contentType?: string | null;
  completedAt?: string | null;
};

async function fetchStudyLogs(params?: URLSearchParams): Promise<StudyLogRecord[]> {
  const query = params?.toString();
  const res = await fetch(`/api/study-logs${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { logs?: StudyLogRecord[] };
  return normalizeStudyLogRecords(data.logs ?? []);
}

export function useUserStatus() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user?.id);
  const todayKey = useMemo(() => getKstDateKey(), []);

  const loadProgress = useCallback(
    async <T extends StudyLogType>(logType: T): Promise<StudyLogRecord<T> | null> => {
      if (isAuthenticated) {
        const params = new URLSearchParams({
          logType,
          kstDate: todayKey,
          limit: "1",
        });
        const logs = await fetchStudyLogs(params);
        return (logs[0] as StudyLogRecord<T> | undefined) ?? null;
      }
      return null;
    },
    [isAuthenticated, todayKey]
  );

  const saveProgress = useCallback(
    async <T extends StudyLogType>(input: SaveInput<T>) => {
      const kstDate = input.kstDate ?? todayKey;
      const record: StudyLogRecord<T> = {
        id: buildStudyLogId({
          userId: session?.user?.id,
          logType: input.logType,
          kstDate,
          contentId: input.contentId,
        }),
        userId: session?.user?.id,
        logType: input.logType,
        kstDate,
        status:
          input.status ??
          ((input.payload as { completed?: boolean }).completed ? "completed" : "in_progress"),
        contentId: input.contentId ?? null,
        contentType: input.contentType ?? null,
        completedAt:
          input.completedAt ??
          ((input.payload as { completed?: boolean }).completed ? new Date().toISOString() : null),
        payload: input.payload as StudyLogPayloadMap[T],
      };

      if (!isAuthenticated) return null;

      try {
        const res = await fetch("/api/study-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ log: record }),
        });
        if (!res.ok) return null;
      } catch {
        return null;
      }
      return record;
    },
    [isAuthenticated, session?.user?.id, todayKey]
  );

  const loadStudyLogs = useCallback(
    async <T extends StudyLogType>(logType?: T): Promise<StudyLogRecord<T>[] | StudyLogRecord[]> => {
      if (isAuthenticated) {
        const params = new URLSearchParams();
        if (logType) params.set("logType", logType);
        return (await fetchStudyLogs(params)) as StudyLogRecord<T>[];
      }
      return [];
    },
    [isAuthenticated]
  );

  const loadDashboardData = useCallback(async (): Promise<DashboardStats> => {
    if (isAuthenticated) {
      const logs = await fetchStudyLogs();
      return aggregateDashboardStatsFromLogs(logs);
    }
    return {
      ...EMPTY_DASHBOARD_STATS,
      last7DayLabels: EMPTY_DASHBOARD_STATS.last7DayLabels,
    };
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    authStatus: status,
    todayKey,
    loadProgress,
    saveProgress,
    loadStudyLogs,
    loadDashboardData,
  };
}
