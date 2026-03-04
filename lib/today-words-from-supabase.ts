import type { TodayWordItem, WordType } from "@/lib/todayWordList";
import { getSupabase } from "@/lib/supabase";

type Row = { id: string; word: string; meaning: string; example: string; type: string };

function rowToItem(row: Row): TodayWordItem {
  const type = (["순우리말", "한자어", "외래어"].includes(row.type) ? row.type : "순우리말") as WordType;
  return {
    word: row.word,
    meaning: row.meaning,
    example: row.example,
    type,
  };
}

/** Supabase today_words 테이블에서 전체 목록 조회. 없으면 빈 배열 */
export async function getTodayWordsFromSupabase(): Promise<TodayWordItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("today_words")
    .select("id, word, meaning, example, type")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as Row[]).map(rowToItem);
}
