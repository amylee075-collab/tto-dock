import type {
  ShortStory,
  RecommendedReading,
  ShortStoryCoreQuiz,
  ShortStoryReadQuiz,
  ShortStorySummaryQuiz,
} from "@/lib/data";
import { getSupabase } from "@/lib/supabase";
import { forceDynamic } from "@/lib/force-dynamic";
import { normalizeDifficultyToLevel } from "@/lib/difficulty-stars";

/**
 * Supabase contents 테이블 필드 매핑 (실제 컬럼명과 동일)
 * 컬럼: id, title, thumbnail_url, content, type, vocabulary, section, badges(배열), difficulty,
 *       core_quiz, read_quizzes, summary_quiz (jsonb, 3단계 문해 활동)
 * 분야·칩 데이터는 badges 필드만 사용. title은 그대로 제목 노출용.
 */
type ContentRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  content: string | null;
  type: string;
  vocabulary?: Array<{ word: string; meaning: string; example: string }> | null;
  section?: string | null;
  /** 분야 등 칩용 배열 (비문학, 사회 등) — Supabase 실제 컬럼명 badges */
  badges?: string[] | unknown;
  difficulty?: number | string | null;
  updated_at?: string | null;
  /** 핵심 단어 퀴즈 (문장, 정답, 유사정답) */
  core_quiz?: unknown;
  /** 독해 퀴즈 배열 (최대 5세트) */
  read_quizzes?: unknown;
  /** 요약 퀴즈 (필수 키워드, 예시 답안 등) */
  summary_quiz?: unknown;
};

export type CategoryContentFilter = "전체" | "과학" | "역사" | "사회" | "예술" | "기술·AI";
export type CategoryContentSort = "title" | "difficulty";

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

/** DB 값(쉬움/보통/어려움 또는 1|2|3) → 1|2|3 숫자, 없으면 undefined */
function parseDifficulty(value: unknown): number | undefined {
  const level = normalizeDifficultyToLevel(value);
  return level ?? undefined;
}

function parseCoreQuiz(v: unknown): ShortStoryCoreQuiz {
  if (v == null || typeof v !== "object") return { question: "", answer: "" };
  const o = v as Record<string, unknown>;
  // DB/레거시 키 호환:
  // - question | problem_sentence
  // - answer | correct_answer
  // - similarAnswers | similar_answers
  const question =
    typeof o.question === "string"
      ? o.question
      : typeof o.problem_sentence === "string"
        ? o.problem_sentence
        : "";
  const answer =
    typeof o.answer === "string"
      ? o.answer
      : typeof o.correct_answer === "string"
        ? o.correct_answer
        : "";
  const sentence =
    typeof o.sentence === "string"
      ? o.sentence
      : typeof o.problem_sentence === "string"
        ? o.problem_sentence
        : undefined;
  const similarAnswers =
    Array.isArray(o.similarAnswers) && o.similarAnswers.every((x) => typeof x === "string")
      ? (o.similarAnswers as string[])
      : Array.isArray(o.similar_answers) && o.similar_answers.every((x) => typeof x === "string")
        ? (o.similar_answers as string[])
      : undefined;
  return { question, answer, ...(sentence && { sentence }), ...(similarAnswers?.length && { similarAnswers }) };
}

function parseReadQuizzes(v: unknown): ShortStoryReadQuiz[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
    .map((o) => {
      const q =
        typeof o.q === "string"
          ? o.q
          : typeof o.question === "string"
            ? o.question
            : "";
      const opts = Array.isArray(o.options) ? o.options.filter((x) => typeof x === "string") as string[] : [];
      const rawAns =
        typeof o.ans === "number"
          ? o.ans
          : typeof o.correct_answer === "number"
            ? o.correct_answer
            : undefined;
      const ans =
        typeof rawAns === "number" &&
        Number.isInteger(rawAns) &&
        rawAns >= 0 &&
        rawAns < opts.length
          ? rawAns
          : 0;
      return { q, options: opts, ans };
    })
    .filter((item) => item.q && item.options.length >= 2);
}

function parseSummaryQuiz(v: unknown): ShortStorySummaryQuiz[] | undefined {
  if (v == null) return undefined;
  const rawArray: unknown[] =
    Array.isArray(v) ? v : typeof v === "object" ? [v] : [];
  const items: ShortStorySummaryQuiz[] = rawArray
    .filter((item) => item != null && typeof item === "object")
    .map((item) => {
      const o = item as Record<string, unknown>;
      const question =
        typeof o.question === "string"
          ? o.question
          : typeof o.prompt === "string"
            ? o.prompt
            : undefined;
      const modelAnswer =
        typeof o.model_answer === "string"
          ? o.model_answer
          : typeof o.modelAnswer === "string"
            ? o.modelAnswer
            : typeof o.exampleAnswer === "string"
              ? o.exampleAnswer
              : undefined;
      const requiredKeywords =
        Array.isArray(o.requiredKeywords) && o.requiredKeywords.every((x) => typeof x === "string")
          ? (o.requiredKeywords as string[])
          : undefined;
      const exampleAnswer = typeof o.exampleAnswer === "string" ? o.exampleAnswer : undefined;
      const charLimitByGrade =
        o.charLimitByGrade != null && typeof o.charLimitByGrade === "object" && !Array.isArray(o.charLimitByGrade)
          ? (o.charLimitByGrade as Record<string, number>)
          : undefined;
      if (!question && !modelAnswer && !requiredKeywords?.length && !exampleAnswer && !charLimitByGrade) {
        return null;
      }
      return {
        ...(question && { question }),
        ...(modelAnswer && { modelAnswer }),
        ...(requiredKeywords?.length && { requiredKeywords }),
        ...(exampleAnswer && { exampleAnswer }),
        ...(charLimitByGrade && { charLimitByGrade }),
      } as ShortStorySummaryQuiz;
    })
    .filter((x): x is ShortStorySummaryQuiz => x != null);
  return items.length > 0 ? items : undefined;
}

export function rowToShortStory(row: ContentRow): ShortStory {
  const vocab = row.vocabulary && Array.isArray(row.vocabulary)
    ? row.vocabulary.filter((v) => v && typeof v.word === "string")
    : [];
  const section = row.section && ["과학", "역사", "사회"].includes(String(row.section)) ? (String(row.section) as "과학" | "역사" | "사회") : undefined;
  const badges = toBadgesArray(row.badges);
  const difficulty = parseDifficulty(row.difficulty);
  const coreQuiz = parseCoreQuiz(row.core_quiz);
  const readQuizzes = parseReadQuizzes(row.read_quizzes);
  const summaryQuiz = parseSummaryQuiz(row.summary_quiz);
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    thumbnail: row.thumbnail_url != null && row.thumbnail_url !== "" ? row.thumbnail_url : "/images/placeholder.png",
    content: row.content != null ? String(row.content) : "",
    vocabulary: vocab.map((v) => ({ word: v.word, meaning: v.meaning ?? "", example: v.example ?? "" })),
    coreQuiz,
    readQuizzes,
    ...(summaryQuiz && { summaryQuiz }),
    ...(section && { section }),
    badges,
    difficulty: difficulty ?? undefined,
  };
}

function hasCategoryFilter(story: ShortStory, filter: Exclude<CategoryContentFilter, "전체">): boolean {
  if (story.section === filter) return true;
  if (!Array.isArray(story.badges)) return false;
  return story.badges.some((badge) => String(badge).trim() === filter);
}

function getDifficultyRank(value: unknown): number {
  const normalized = normalizeDifficultyToLevel(value);
  if (normalized != null) return normalized;

  const raw = typeof value === "string" ? value.trim() : "";
  if (raw === "하") return 1;
  if (raw === "중") return 2;
  if (raw === "상") return 3;
  return 99;
}

function sortCategoryStories(stories: ShortStory[], sortBy: CategoryContentSort): ShortStory[] {
  const copied = [...stories];
  if (sortBy === "difficulty") {
    return copied.sort((a, b) => {
      const rankA = getDifficultyRank(a.difficulty);
      const rankB = getDifficultyRank(b.difficulty);
      if (rankA !== rankB) return rankA - rankB;
      return a.title.localeCompare(b.title, "ko");
    });
  }

  return copied.sort((a, b) => a.title.localeCompare(b.title, "ko"));
}

export async function getCategoryContentsFromSupabase(options?: {
  filter?: CategoryContentFilter;
  sortBy?: CategoryContentSort;
}): Promise<ShortStory[]> {
  await forceDynamic();

  const supabase = getSupabase();
  if (!supabase) return [];

  const filter = options?.filter ?? "전체";
  const sortBy = options?.sortBy ?? "title";

  let query = supabase.from("contents").select("*").eq("type", "category");

  if (sortBy === "title") {
    query = query.order("title", { ascending: true });
  } else {
    // 난이도 컬럼이 문자열/숫자가 혼용될 수 있어 DB 조회 후 안전하게 보정 정렬합니다.
    query = query.order("updated_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Supabase] getCategoryContentsFromSupabase error", error);
    return [];
  }
  if (!data || !Array.isArray(data)) return [];

  const stories = (data as ContentRow[]).map(rowToShortStory);
  const filtered =
    filter === "전체"
      ? stories
      : stories.filter((story) => hasCategoryFilter(story, filter));

  return sortCategoryStories(filtered, sortBy);
}

const CONTENT_TYPES = ["short", "category", "digital", "long"] as const;
export type ContentTypeSupabase = (typeof CONTENT_TYPES)[number];

function isValidContentType(v: unknown): v is ContentTypeSupabase {
  return typeof v === "string" && (CONTENT_TYPES as readonly string[]).includes(v);
}

/**
 * Supabase contents 테이블에서 type·id로 1건 조회.
 * .select('*')로 모든 컬럼 조회 — core_quiz, read_quizzes, summary_quiz 포함.
 * PGRST100 방지: 서버에는 .eq('id')만 사용, type은 조회 후 검증.
 */
export async function getContentFromSupabase(
  type: ContentTypeSupabase,
  id: string
): Promise<ShortStory | null> {
  await forceDynamic();

  if (!isValidContentType(type)) {
    console.error("[Supabase] getContentFromSupabase invalid type", { type, typeOf: typeof type });
    return null;
  }
  const idStr = id != null && typeof id === "string" ? id.trim() : "";
  if (!idStr) {
    console.error("[Supabase] getContentFromSupabase invalid id", { id, idOf: typeof id });
    return null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  console.log("[Supabase] getContentFromSupabase params", {
    type,
    id: idStr,
    query: "from(contents).select('*').eq('id', idStr).maybeSingle()",
  });

  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", idStr)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as ContentRow;
  console.log("FETCHED CONTENT:", {
    id: row?.id,
    title: row?.title,
    core_quiz: row?.core_quiz,
    read_quizzes: row?.read_quizzes,
    summary_quiz: row?.summary_quiz,
  });
  const rowType = row.type != null ? String(row.type).toLowerCase() : "";
  if (rowType !== type) return null;
  return rowToShortStory(row);
}

/**
 * Supabase에서 type별 목록 조회.
 * .select('*')로 모든 컬럼 조회 — core_quiz, read_quizzes, summary_quiz 포함.
 * PGRST100 방지: 서버 쿼리는 .select('*')만 사용, type 필터는 가져온 뒤 프론트에서 적용.
 */
export async function getContentsByTypeFromSupabase(
  type: ContentTypeSupabase
): Promise<ShortStory[]> {
  await forceDynamic();

  if (!isValidContentType(type)) {
    console.error("[Supabase] getContentsByTypeFromSupabase invalid type", {
      type,
      typeOf: typeof type,
      allowed: [...CONTENT_TYPES],
    });
    return [];
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  console.log("[Supabase] getContentsByTypeFromSupabase params", {
    type,
    query: "from(contents).select('*') only — no order/filter (PGRST100 방지)",
  });

  const { data, error } = await supabase.from("contents").select("*");

  if (error) {
    console.error("[Supabase] getContentsByTypeFromSupabase error", error);
    return [];
  }
  if (!data || !Array.isArray(data)) return [];

  const typeStr = String(type).toLowerCase();
  const rows = (data as ContentRow[]).filter((row) => {
    const r = row.type != null ? String(row.type).toLowerCase() : "";
    return r === typeStr;
  });
  const byUpdated = (a: ContentRow, b: ContentRow) => {
    const ta = a.updated_at != null ? String(a.updated_at) : "";
    const tb = b.updated_at != null ? String(b.updated_at) : "";
    return tb.localeCompare(ta);
  };
  rows.sort(byUpdated);
  return rows.map(rowToShortStory);
}

/**
 * id만으로 1건 조회 (type 무관). .select('*') — core_quiz, read_quizzes, summary_quiz 포함.
 * id 유효하지 않으면 쿼리 생략.
 */
export async function getContentByIdFromSupabase(
  id: string
): Promise<{ story: ShortStory; type: ContentTypeSupabase } | null> {
  await forceDynamic();
  const idStr = id != null && typeof id === "string" ? id.trim() : "";
  if (!idStr) {
    console.error("[Supabase] getContentByIdFromSupabase invalid id", { id, idOf: typeof id });
    return null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  console.log("[Supabase] getContentByIdFromSupabase params", {
    id: idStr,
    query: "from(contents).select('*').eq('id', idStr).maybeSingle()",
  });

  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", idStr)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as ContentRow;
  console.log("FETCHED CONTENT:", {
    id: row?.id,
    title: row?.title,
    core_quiz: row?.core_quiz,
    read_quizzes: row?.read_quizzes,
    summary_quiz: row?.summary_quiz,
  });
  const t = (typeof row.type === "string" ? row.type : String(row.type ?? "")) as ContentTypeSupabase;
  if (!CONTENT_TYPES.includes(t)) return null;
  return { story: rowToShortStory(row), type: t };
}

/** 홈 '오늘의 학습' 추천 글: long/category/digital 중 Supabase에서 랜덤 1개 */
export async function getRandomRecommendedReadingFromSupabase(): Promise<RecommendedReading> {
  await forceDynamic();
  const roll = Math.floor(Math.random() * 3);
  if (roll === 0) {
    const list = await getContentsByTypeFromSupabase("long");
    const item = list[Math.floor(Math.random() * list.length)];
    return {
      type: "long",
      title: item?.title ?? "긴 글 읽기",
      href: item ? `/reading/long/${item.id}` : "/reading/long",
      subtitle: "본문 정독",
    };
  }
  if (roll === 1) {
    const list = await getContentsByTypeFromSupabase("category");
    const item = list[Math.floor(Math.random() * list.length)];
    return {
      type: "category",
      title: item?.title ?? "분야별 글 읽기",
      href: item ? `/reading/category/${item.id}` : "/reading/category",
      subtitle: "과학 / 역사 / 사회",
    };
  }
  const list = await getContentsByTypeFromSupabase("digital");
  const item = list[Math.floor(Math.random() * list.length)];
  return {
    type: "digital",
    title: item?.title ?? "디지털 문해력",
    href: item ? `/reading/digital/${item.id}` : "/reading/digital",
    subtitle: "신문·미디어 비판",
  };
}

/** 랜덤 ID 조회 (API용). category일 때 section이면 badges에 해당 분야 포함된 것만 */
export async function getRandomStoryIdFromSupabase(
  type: ContentTypeSupabase,
  section?: "과학" | "역사" | "사회"
): Promise<string | null> {
  const list = await getContentsByTypeFromSupabase(type);
  let filtered = list;
  if (type === "category" && section) {
    filtered = list.filter(
      (s) => Array.isArray(s.badges) && s.badges.some((tag) => String(tag).includes(section))
    );
  }
  if (filtered.length === 0) return null;
  const item = filtered[Math.floor(Math.random() * filtered.length)];
  return item?.id ?? null;
}
