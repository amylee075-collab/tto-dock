"use client";

import { useState, useEffect, useCallback } from "react";
import CoreWordPractice from "@/components/practice/CoreWordPractice";
import type { CoreWordQuizItem } from "@/lib/coreWordPractice";
import { getTodayKSTDate } from "@/lib/daily-core-word-quiz";

const STORAGE_KEY = "core_word_solved_ids";
/** 학습 결과 리포트에서 2회 오답(isCorrect: false) 문항 조회용 */
export const WRONG_IDS_KEY = "core_word_wrong_ids";

function loadSolvedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function saveSolvedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    const existing = loadSolvedIds();
    const set = new Set([...existing, ...ids]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

/** 2회 오답 후 넘어간 문항 ID — 학습 결과 리포트에서 isCorrect: false 로 구분용 */
export function loadWrongIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WRONG_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function saveWrongId(quizId: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = loadWrongIds();
    if (existing.includes(quizId)) return;
    localStorage.setItem(WRONG_IDS_KEY, JSON.stringify([...existing, quizId]));
  } catch {
    // ignore
  }
}

export default function CoreWordDailyWrapper() {
  const [dailyItems, setDailyItems] = useState<CoreWordQuizItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const solvedIds = loadSolvedIds();
    const date = getTodayKSTDate();
    const params = new URLSearchParams({
      solvedIds: solvedIds.join(","),
      date,
    });
    fetch(`/api/practice/core-word/daily?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("데일리 퀴즈를 불러오지 못했어요.");
        return res.json();
      })
      .then((data) => {
        const items = data.items ?? [];
        setDailyItems(Array.isArray(items) ? items : []);
      })
      .catch((e) => setError(e.message ?? "오류가 났어요."));
  }, []);

  const handleCorrect = useCallback((quizId: string) => {
    saveSolvedIds([quizId]);
  }, []);

  /** 2회 오답 후 정답 공개하고 넘어간 문항 — 리포트에서 isCorrect: false 로 사용 */
  const handleWrong = useCallback((quizId: string) => {
    saveWrongId(quizId);
  }, []);

  const handleComplete = useCallback((quizIds: string[]) => {
    saveSolvedIds(quizIds);
  }, []);

  if (error) {
    return (
      <div className="w-full max-w-screen-xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <a href="/practice/core-word" className="text-[#ff5700] font-medium underline">
          다시 시도
        </a>
      </div>
    );
  }

  if (dailyItems === null) {
    return (
      <div className="w-full max-w-screen-xl mx-auto px-4 py-12 flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">오늘의 문제를 불러오는 중…</p>
      </div>
    );
  }

  if (dailyItems.length === 0) {
    return (
      <div className="w-full max-w-screen-xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">준비된 문제가 없어요.</p>
        <a href="/" className="text-[#ff5700] font-medium underline">
          홈으로
        </a>
      </div>
    );
  }

  return (
    <CoreWordPractice
      items={dailyItems}
      onCorrect={handleCorrect}
      onWrong={handleWrong}
      onComplete={handleComplete}
    />
  );
}
