import { NextRequest, NextResponse } from "next/server";
import { getCoreWordQuizFromSupabase } from "@/lib/core-word-quiz-from-supabase";
import { CORE_WORD_QUIZ_ITEMS } from "@/lib/coreWordPractice";
import {
  getDailyCoreWordQuiz,
  getTodayKSTDate,
  DAILY_COUNT,
} from "@/lib/daily-core-word-quiz";

/** revalidate = 0 으로 매일 신선한 데일리 세트 보장 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/practice/core-word/daily?solvedIds=id1,id2,&date=YYYY-MM-DD
 * 오늘(KST) 기준 10문제 랜덤 선정. solvedIds 제외, 부족 시 순환.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const solvedParam = searchParams.get("solvedIds");
  const solvedIds = solvedParam
    ? solvedParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const dateParam = searchParams.get("date");
  const dateKST = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? dateParam
    : getTodayKSTDate();

  const fromSupabase = await getCoreWordQuizFromSupabase();
  const allItems = fromSupabase.length > 0 ? fromSupabase : CORE_WORD_QUIZ_ITEMS;
  const daily = getDailyCoreWordQuiz(allItems, solvedIds, dateKST);

  const body = {
    date: dateKST,
    total: DAILY_COUNT,
    items: daily,
  };
  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
