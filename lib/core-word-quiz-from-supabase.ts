import type { CoreWordQuizItem } from "@/lib/coreWordPractice";
import { getSupabase } from "@/lib/supabase";

type Row = {
  id: string;
  sentence: string;
  correct_answer: string;
  selectable_words: string[];
  feedback_by_word: Record<string, string>;
  sort_order: number | null;
};

function rowToItem(row: Row, index: number): CoreWordQuizItem {
  return {
    id: row.sort_order ?? index + 1,
    sentence: row.sentence,
    correctAnswer: row.correct_answer,
    selectableWords: row.selectable_words ?? [],
    feedbackByWord: row.feedback_by_word ?? {},
  };
}

/** Supabase core_word_quiz 테이블에서 전체 문항 조회. 없으면 빈 배열 */
export async function getCoreWordQuizFromSupabase(): Promise<CoreWordQuizItem[]> {
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
