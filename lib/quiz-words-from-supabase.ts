import { getSupabase } from "@/lib/supabase";
import { forceDynamic } from "@/lib/force-dynamic";

export type QuizWordItem = {
  id: string;
  word: string;
  meaning: string;
  /** 예문 — today_words_100.csv / DB 컬럼명 example. 비어 있으면 기본 질문으로 퀴즈 유지 */
  example: string;
  /** 문항별 셔플된 보기 3개 [정답, 오답1, 오답2]. 서버에서 한 번만 섞어 하이드레이션 일치 */
  options?: string[];
};

/** 예문이 비어 있어도 퀴즈가 멈추지 않도록 기본 문구 (3개 퀴즈 보장) */
const DEFAULT_EXAMPLE = "이 단어의 의미로 올바른 것은?";

type WordsRow = { id: string; word: string; meaning: string; example?: string };
type TodayWordsRow = { id: string; word: string; meaning: string; example?: string };

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** DB 컬럼명 example만 사용. 비어 있으면 DEFAULT_EXAMPLE 반환 → 퀴즈 3개 항상 출력 */
function toExample(row: { example?: string }): string {
  const s = (row.example ?? "").toString().trim();
  return s.length > 0 ? s : DEFAULT_EXAMPLE;
}

/**
 * 퀴즈용 단어 3개 + 오답 풀.
 * - today_words / today_words_100.csv 기준: word, meaning, example 필드명 정확히 매칭.
 * - excludeWords: **상단 노출 단어 딱 1개만** 제외 (slice(0,1)). 전체 리스트 제외 금지 → 퀴즈 0개 방지.
 * - 제외 후 후보가 0개면 exclude 없이 전체로 퀴즈 생성.
 * - DB 예문 컬럼명: example. 비어 있으면 기본 문구로 퀴즈 멈춤 방지.
 */
export type QuizWordsResult = {
  quizItems: QuizWordItem[];
  optionPool: QuizWordItem[];
};

const WANT_QUIZ_COUNT = 3;

function safeMapRow(
  row: TodayWordsRow | WordsRow,
  fallbackId: number
): QuizWordItem | null {
  try {
    const word = (row.word ?? "").toString().trim();
    if (!word) return null;
    return {
      id: (row as { id?: string }).id ?? String(fallbackId),
      word,
      meaning: (row.meaning ?? "").toString(),
      example: toExample(row),
    };
  } catch {
    return null;
  }
}

export async function getQuizWordsFromSupabase(
  excludeWords: string[]
): Promise<QuizWordsResult> {
  await forceDynamic();
  const supabase = getSupabase();
  if (!supabase) {
    return { quizItems: [], optionPool: [] };
  }

  /** 상단에 강조된 단어 딱 1개만 제외 (단어 문자열). 전체 리스트 제외 금지 → 99개로 퀴즈 생성 */
  const excludeSet = new Set(
    excludeWords.slice(0, 1).map((w) => String(w).trim()).filter(Boolean)
  );

  const { data: todayData, error: todayError } = await supabase
    .from("today_words")
    .select("id, word, meaning, example")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!todayError && todayData && todayData.length > 0) {
    const mapped: QuizWordItem[] = (todayData as TodayWordsRow[])
      .map((row, i) => safeMapRow(row, i + 1))
      .filter((item): item is QuizWordItem => item != null);
    let filtered =
      excludeSet.size > 0
        ? mapped.filter((w) => !excludeSet.has(w.word))
        : mapped;
    if (filtered.length === 0) filtered = mapped;
    const shuffled = shuffle(filtered);
    const rawQuiz = shuffled.slice(0, Math.min(WANT_QUIZ_COUNT, shuffled.length));
    const quizIds = new Set(rawQuiz.map((q) => q.id));
    const optionPool = filtered.filter((w) => !quizIds.has(w.id));
    const poolWords = optionPool.map((w) => w.word);
    const quizItems = rawQuiz.map((item) => {
      const others = Array.from(
        new Set([...poolWords, ...rawQuiz.filter((q) => q.id !== item.id).map((q) => q.word)])
      ).filter((w) => w !== item.word);
      const wrongs = shuffle(others).slice(0, 2);
      const options = shuffle([item.word, ...wrongs]);
      return { ...item, options };
    });
    return { quizItems, optionPool };
  }

  const { data: wordsData, error: wordsError } = await supabase
    .from("words")
    .select("id, word, meaning, example")
    .limit(100);

  if (!wordsError && wordsData && wordsData.length > 0) {
    const mapped: QuizWordItem[] = (wordsData as WordsRow[])
      .map((row, i) => safeMapRow(row, i + 1))
      .filter((item): item is QuizWordItem => item != null);
    let filtered =
      excludeSet.size > 0
        ? mapped.filter((w) => !excludeSet.has(w.word))
        : mapped;
    if (filtered.length === 0) filtered = mapped;
    const shuffled = shuffle(filtered);
    const rawQuiz = shuffled.slice(0, Math.min(WANT_QUIZ_COUNT, shuffled.length));
    const quizIds = new Set(rawQuiz.map((q) => q.id));
    const optionPool = filtered.filter((w) => !quizIds.has(w.id));
    const poolWords = optionPool.map((w) => w.word);
    const quizItems = rawQuiz.map((item) => {
      const others = [...new Set([...poolWords, ...rawQuiz.filter((q) => q.id !== item.id).map((q) => q.word)])]
        .filter((w) => w !== item.word);
      const wrongs = shuffle(others).slice(0, 2);
      const options = shuffle([item.word, ...wrongs]);
      return { ...item, options };
    });
    return { quizItems, optionPool };
  }

  return { quizItems: [], optionPool: [] };
}
