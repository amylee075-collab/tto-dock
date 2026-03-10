import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { forceDynamic } from "@/lib/force-dynamic";

/** 어드민 수정 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeFeedbackByWord(raw: unknown): Record<string, string> {
  if (raw == null) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, string>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, string>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * GET /api/practice/core-word/feedback?quizId=<uuid>
 * 정/오답 팝업의 '두 번째 피드백 줄'이 어드민 수정사항을 즉시 반영하도록,
 * 해당 문항의 feedback_by_word만 no-store로 재조회.
 */
export async function GET(request: NextRequest) {
  await forceDynamic();
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get("quizId")?.trim();
  if (!quizId) {
    return NextResponse.json({ error: "quizId가 필요합니다." }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 설정이 없습니다." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("core_word_quiz")
    .select("id, feedback_by_word")
    .eq("id", quizId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "피드백을 찾지 못했습니다." },
      { status: 404 }
    );
  }

  const feedbackByWord = normalizeFeedbackByWord((data as { feedback_by_word?: unknown }).feedback_by_word);
  return new NextResponse(JSON.stringify({ quizId, feedbackByWord }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

