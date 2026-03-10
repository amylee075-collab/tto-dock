import type { CoreWordQuizItem } from "@/lib/coreWordPractice";
import { getSupabase } from "@/lib/supabase";
import { forceDynamic } from "@/lib/force-dynamic";

type Row = {
  id: string;
  sentence: string;
  correct_answer: string;
  selectable_words: string[] | unknown;
  feedback_by_word?: Record<string, string> | string | null;
  sort_order: number | null;
};

/** 어드민에서 수정한 단어별 피드백이 항상 반영되도록 객체로 정규화 (문자열이면 JSON 파싱) */
function normalizeFeedbackByWord(raw: Row["feedback_by_word"]): Record<string, string> {
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

function rowToItem(row: Row, index: number): CoreWordQuizItem {
  return {
    id: (row.sort_order ?? index + 1) as number,
    quizId: row.id,
    sentence: row.sentence,
    correctAnswer: row.correct_answer,
    selectableWords: Array.isArray(row.selectable_words) ? row.selectable_words : [],
    feedbackByWord: normalizeFeedbackByWord(row.feedback_by_word),
  };
}

/** Supabase core_word_quiz 테이블에서 전체 문항 조회. 없으면 빈 배열 */
export async function getCoreWordQuizFromSupabase(): Promise<CoreWordQuizItem[]> {
  await forceDynamic();
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("core_word_quiz")
    .select("id, sentence, correct_answer, selectable_words, feedback_by_word, sort_order")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as Row[]).map((row, i) => rowToItem(row, i));
}
