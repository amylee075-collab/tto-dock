import type { ShortStory } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";

type ContentRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  content: string | null;
  type: string;
  vocabulary?: Array<{ word: string; meaning: string; example: string }> | null;
  section?: string | null;
  badges?: string[] | unknown;
};

function toBadgesArray(badges: ContentRow["badges"]): string[] {
  if (badges == null) return [];
  if (Array.isArray(badges)) return badges.filter((b): b is string => typeof b === "string");
  if (typeof badges === "string") {
    try {
      const p = JSON.parse(badges);
      return Array.isArray(p) ? p.filter((b: unknown) => typeof b === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function rowToShortStory(row: ContentRow): ShortStory {
  const vocab = row.vocabulary && Array.isArray(row.vocabulary)
    ? row.vocabulary.filter((v) => v && typeof v.word === "string")
    : [];
  const section = row.section && ["과학", "역사", "사회"].includes(row.section) ? (row.section as "과학" | "역사" | "사회") : undefined;
  const badges = toBadgesArray(row.badges);
  return {
    id: row.id,
    title: row.title,
    thumbnail: row.thumbnail_url ?? "/images/placeholder.png",
    content: row.content ?? "",
    vocabulary: vocab.map((v) => ({ word: v.word, meaning: v.meaning ?? "", example: v.example ?? "" })),
    coreQuiz: { question: "", answer: "" },
    readQuizzes: [],
    ...(section && { section }),
    ...(badges.length > 0 && { badges }),
  };
}

/** Supabase contents 테이블에서 type·id로 1건 조회 후 ShortStory로 변환. 없으면 null */
export async function getContentFromSupabase(
  type: "short" | "category" | "digital",
  id: string
): Promise<ShortStory | null> {
  console.log("[Supabase fetch] getContentFromSupabase", { type, id, ts: Date.now() });
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("contents")
    .select("id, title, thumbnail_url, content, type, vocabulary, section, badges")
    .eq("id", id)
    .eq("type", type)
    .maybeSingle();

  if (error || !data) return null;
  return rowToShortStory(data as ContentRow);
}

/** Supabase에서 type별 목록 조회 (관리자에서 등록한 콘텐츠만). 없으면 빈 배열 */
export async function getContentsByTypeFromSupabase(
  type: "short" | "category" | "digital"
): Promise<ShortStory[]> {
  console.log("[Supabase fetch] getContentsByTypeFromSupabase", { type, ts: Date.now() });
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("contents")
    .select("id, title, thumbnail_url, content, type, vocabulary, section, badges")
    .eq("type", type)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return (data as ContentRow[]).map(rowToShortStory);
}
