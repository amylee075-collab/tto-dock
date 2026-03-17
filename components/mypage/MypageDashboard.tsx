// 파일 인코딩 강제 고정: UTF-8
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  aggregateDashboardStatsFromLogs,
  getAttendanceWindow,
  getLast7KstDateKeys,
  type StudyLogRecord,
} from "@/lib/study-log-types";
import { STUDY_LOGS_UPDATED_EVENT, useUserStatus } from "@/hooks/useUserStatus";
import StudyLogReportModal from "@/components/mypage/StudyLogReportModal";
import { useBadgeManager } from "@/hooks/useBadgeManager";
import type { BadgeItem } from "@/lib/badges";
import { BADGE_LIST } from "@/lib/badges";
import BadgeIcon from "@/components/mypage/BadgeIcon";
import MypageTabs from "@/components/mypage/MypageTabs";

function getDisplayName(name?: string | null, email?: string | null): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  const trimmedEmail = email?.trim();
  if (trimmedEmail) return trimmedEmail;
  return "사용자";
}

function formatAttendanceDayLabel(ymd: string): string {
  const [, month, day] = ymd.split("-");
  return `${month}/${day}`;
}

function AttendanceSlot(props: {
  dayLabel: string;
  monthDay: string;
  isToday: boolean;
  isFuture: boolean;
  present: boolean;
}) {
  const { dayLabel, monthDay, isToday, isFuture, present } = props;

  if (isFuture) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[16px] font-bold text-slate-700">{dayLabel}</span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white" />
        <span className="text-[14px] font-medium text-slate-500">{monthDay}</span>
      </div>
    );
  }

  if (isToday) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[16px] font-bold text-slate-700">{dayLabel}</span>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg ${
            present
              ? "bg-emerald-600 text-white font-bold"
              : "border-2 border-gray-300 bg-white text-gray-300"
          }`}
        >
          {present ? "✓" : "✕"}
        </div>
        <span className="text-[14px] font-medium text-slate-500">{monthDay}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[16px] font-bold text-slate-700">{dayLabel}</span>
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full text-white text-lg ${
          present ? "bg-emerald-500" : "bg-gray-300"
        }`}
      >
        {present ? "✓" : "✕"}
      </span>
      <span className="text-[14px] font-medium text-slate-500">{monthDay}</span>
    </div>
  );
}

function BadgeCard({ badge }: { badge: BadgeItem & { unlocked: boolean } }) {
  const unlocked = badge.unlocked;
  const isPlaceholder = !unlocked && badge.icon === "HelpCircle";
  return (
    <div
      className="group flex h-auto flex-col items-center justify-center gap-1 text-center"
    >
      <div className="flex items-center justify-center">
        <BadgeIcon
          iconName={badge.icon}
          subIconName={badge.subIcon}
          isEarned={unlocked}
          category={badge.category}
          size="lg"
          className="group-hover:-translate-y-1 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-center">
        {!isPlaceholder && (
          <p
            className={`text-[18px] font-bold leading-snug ${
              unlocked ? "text-slate-800" : "text-slate-400"
            }`}
          >
            {badge.name}
          </p>
        )}
      </div>
      <div className="flex items-start justify-center">
        {!isPlaceholder && (
          <p
            className={`text-[15px] font-medium leading-5 tracking-tight ${
              unlocked ? "text-slate-600" : "text-slate-400"
            }`}
          >
            {badge.description}
          </p>
        )}
      </div>
    </div>
  );
}

function getLatestUnlockedBadge(badges: (BadgeItem & { unlocked: boolean })[]) {
  const unlocked = badges.filter(b => b.unlocked);
  return unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
}

export default function MypageDashboard() {
  const { data: session } = useSession();
  const { isAuthenticated, authStatus, loadStudyLogs } = useUserStatus();
  const [profileNickname, setProfileNickname] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [stats, setStats] = useState(aggregateDashboardStatsFromLogs([]));
  const [readingLogs, setReadingLogs] = useState<StudyLogRecord<"reading_session">[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<StudyLogRecord<"reading_session"> | null>(null);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState(false);
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
    if (!isAuthenticated) {
      setProfileNickname(null);
      setProfileLoaded(false);
      return;
    }
    let alive = true;
    const loadProfileNickname = async () => {
      try {
        const res = await fetch("/api/mypage/profile", { cache: "no-store" });
        const json = (await res.json()) as { profile?: { nickname?: string | null } };
        if (!alive) return;
        const next = json.profile?.nickname?.trim();
        setProfileNickname(next && next.length > 0 ? next : null);
      } catch {
        if (!alive) return;
        setProfileNickname(null);
      }
      setProfileLoaded(true);
    };
    void loadProfileNickname();
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

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

  const displayName =
    isAuthenticated
      ? (profileNickname?.trim() ?? (profileLoaded ? "" : ""))
      : getDisplayName(session?.user?.name, session?.user?.email);
  const { getBadgesWithUnlocked } = useBadgeManager({
    totalSentencesRead: stats.totalSentencesRead,
    todayAccuracy: stats.todayAccuracy,
    averageWpm: stats.averageWpm,
    streakDays: stats.streakDays,
    completedSessionCount: readingLogs.length,
  });
  const badges = useMemo(
    () => getBadgesWithUnlocked(),
    [getBadgesWithUnlocked, stats.totalSentencesRead, stats.todayAccuracy, stats.averageWpm, stats.streakDays, readingLogs.length]
  );
  const unlockedBadges = useMemo(
    () => badges.filter((badge) => badge.unlocked),
    [badges]
  );
  const top5WithFillers = useMemo(() => {
    const unlockedOrdered = badges.filter((b) => b.unlocked);
    const recentUnlocked = unlockedOrdered.slice(-5);
    if (recentUnlocked.length >= 5) return recentUnlocked.slice(-5);
    const need = 5 - recentUnlocked.length;
    const lockedPool = badges.filter((b) => !b.unlocked);
    const fillers = lockedPool.slice(0, need).map((b) => ({
      ...b,
      // 아직 획득하지 않은 슬롯은 물음표 아이콘으로 표시
      icon: "HelpCircle",
      subIcon: "HelpCircle",
    }));
    return [...recentUnlocked, ...fillers];
  }, [badges]);
  const latestUnlockedBadge = useMemo(() => getLatestUnlockedBadge(badges), [badges]);

  const attendanceSlots = useMemo(() => {
    const attendanceSet = new Set(
      readingLogs
        .filter((log) => log.status === "completed" && Boolean(log.kstDate))
        .map((log) => log.kstDate)
    );
    return getAttendanceWindow().map((item) => ({
      ...item,
      // 오늘은 '최초 로그인 시점' 기준으로 도장을 찍어 주기 위해
      // 학습 기록이 없어도 현재 날짜라면 출석으로 처리한다.
      present: item.isToday ? true : attendanceSet.has(item.dateKey),
    }));
  }, [readingLogs]);

  const last7Keys = useMemo(() => getLast7KstDateKeys(), []);
  const recentReadingLogs = useMemo(() => {
    const recentLogs = readingLogs.filter((log) => last7Keys.includes(log.kstDate));
    return showAllRecords ? recentLogs : recentLogs.slice(0, 5);
  }, [last7Keys, readingLogs, showAllRecords]);

  if (authStatus === "loading") {
    return <div className="py-8 font-pretendard" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="py-8 font-pretendard">
        <section className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-3 text-xl font-extrabold text-[#212529]">로그인이 필요합니다</h2>
          <p className="mb-6 text-base leading-6 text-gray-500">
            마이페이지 정보를 확인하려면 먼저 로그인을 해주세요.
          </p>
          <button
            type="button"
            onClick={() => signIn()}
            className="inline-flex items-center justify-center rounded-xl bg-[#FF5C00] px-5 py-3 text-base font-bold text-white hover:opacity-90"
          >
            로그인하기
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="py-8 font-pretendard leading-relaxed bg-white">
      <div className="space-y-16">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[28px] font-bold tracking-tight text-[#212529] mb-2 sm:mb-0">
            마이페이지
          </h1>
          <Link
            href="/mypage/info/edit"
            className="inline-flex items-center justify-center self-start rounded-full border border-[#F97316]/20 px-5 py-3 text-base font-bold text-[#F97316] transition-colors hover:bg-[#FFF1E8] sm:self-auto"
          >
            내 정보 수정
          </Link>
        </header>

        <MypageTabs />

        {/* 기본 정보 + 최근 획득 배지 */}
        <section className="pt-0 pb-12 border-b border-gray-100">
          <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <p className="text-[20px] font-semibold text-slate-800 mb-4">별명</p>
              <p className="text-[18px] font-semibold tracking-tight text-slate-800">
                {displayName}
              </p>
            </div>
            <div>
              <p className="text-[20px] font-semibold text-slate-800 mb-4">이메일</p>
              <p className="break-all text-[18px] font-semibold text-slate-800">
                {session?.user?.email ?? "정보를 불러올 수 없습니다."}
              </p>
            </div>
            <div>
              <p className="text-[20px] font-semibold text-slate-800 mb-4">최근 획득 배지</p>
              {latestUnlockedBadge ? (
                <div className="mt-3 flex items-center gap-3">
                  <BadgeIcon
                    iconName={latestUnlockedBadge.icon}
                    subIconName={latestUnlockedBadge.subIcon}
                    isEarned={latestUnlockedBadge.unlocked}
                    category={latestUnlockedBadge.category}
                  />
                  <div className="min-w-0">
                    <p className="text-[18px] font-bold text-slate-700">
                      {latestUnlockedBadge.name}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {latestUnlockedBadge.description}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-base font-bold text-[#212529]">
                  아직 획득한 배지가 없어요
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 출석 체크 */}
        <section className="pt-0 pb-12 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[20px] font-semibold text-slate-800">출석 체크</p>
          </div>
          <div className="mt-5">
            <div className="grid grid-cols-5 gap-4 md:gap-6 lg:gap-8 justify-items-center">
              {attendanceSlots.map((slot) => (
                <AttendanceSlot
                  key={slot.dateKey}
                  dayLabel={slot.dayLabel}
                  monthDay={formatAttendanceDayLabel(slot.dateKey)}
                  isToday={slot.isToday}
                  isFuture={slot.isFuture}
                  present={slot.present}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 획득한 배지 */}
        <section className="pt-0 pb-12 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[20px] font-semibold text-slate-800">획득한 배지</p>
            </div>
            <button
              type="button"
              onClick={() => setBadgeModalOpen(true)}
              className="rounded-full border border-[#F97316]/20 px-4 py-2 text-base font-bold text-[#F97316] transition-colors hover:bg-[#FFF1E8]"
            >
              전체 배지
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
            {top5WithFillers.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                <BadgeCard badge={badge} />
              </div>
            ))}
          </div>
        </section>

        {/* 최근 학습 기록 */}
        <section className="pt-0 pb-16 border-b border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[20px] font-semibold text-slate-800">최근 학습 기록</p>
              <p className="mt-1 text-xs text-gray-500">
                * 최근 7일간의 문해 학습 리포트만 조회 가능합니다.
              </p>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-gray-500">최근 7일 기록</span>
          </div>

          {recentReadingLogs.length === 0 ? (
            <p className="mt-5 text-base font-medium leading-7 text-gray-500">
              최근 7일간 학습 기록이 없습니다.
            </p>
          ) : (
            <div className="mt-5 divide-y divide-gray-100 border-t border-b border-gray-100">
              {recentReadingLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-1 gap-4 py-4 md:grid-cols-[110px_minmax(0,1fr)_120px_104px]"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-500">날짜</p>
                    <p className="mt-1 text-base font-bold text-[#212529]">{log.kstDate}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-500">제목</p>
                    <p className="mt-1 truncate text-base font-bold text-[#212529]">
                      {log.payload.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">퀴즈 결과</p>
                    <p className="mt-1 text-base font-bold text-[#212529]">
                      {log.payload.quizCorrect} / {log.payload.quizTotal}
                    </p>
                  </div>
                  <div className="flex items-center md:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="rounded-full bg-[#F97316] px-4 py-2 text-base font-bold text-white transition-opacity hover:opacity-90"
                    >
                      리포트
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-center text-base text-gray-500" role="status" aria-live="polite">
          매일 꾸준한 독서 습관이 문해력 성장의 큰 힘이 됩니다.
        </p>
      </div>

      <StudyLogReportModal log={selectedLog} onClose={() => setSelectedLog(null)} />

      {badgeModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-[#F97316]">획득한 배지</p>
                <h3 className="mt-1 text-2xl font-extrabold text-[#212529]">전체 배지 보기</h3>
              </div>
              <button
                type="button"
                onClick={() => setBadgeModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
                aria-label="모달 닫기"
              >
                ✕
              </button>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {badges.map((badge) => (
                <li key={badge.id}>
                  <BadgeCard badge={badge} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}