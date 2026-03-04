/**
 * TTO-DOCK2 데이터를 Supabase(관리자)로 옮기는 스크립트
 * - contents: 짧은 글·긴 글·분야별·디지털 콘텐츠
 * - today_words: 오늘의 단어 목록
 * - core_word_quiz: 문해력 기초 퀴즈(핵심 단어 찾기) 10문항
 *
 * 실행 전:
 * 1. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 설정
 * 2. contents 테이블 id는 TEXT 타입 권장 (기존 스토리 id 사용 시)
 * 3. npm run migrate:contents
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
import {
  shortStories,
  longStories,
  categoryStories,
  digitalLiteracy,
} from "../lib/data";
import { TODAY_WORD_LIST } from "../lib/todayWordList";
import { CORE_WORD_QUIZ_ITEMS } from "../lib/coreWordPractice";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 를 .env.local에 설정하세요.");
  process.exit(1);
}

const supabase = createClient(url, key);

type VocabItem = { word: string; meaning: string; example: string };

type Row = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  type: string;
  content: string | null;
  vocabulary: VocabItem[] | null;
  created_at: string;
  updated_at: string;
};

function toRow(
  story: {
    id: string;
    title: string;
    thumbnail: string;
    content: string;
    vocabulary?: VocabItem[];
  },
  type: "short" | "long" | "category" | "digital"
): Row {
  const now = new Date().toISOString();
  const vocab =
    story.vocabulary && Array.isArray(story.vocabulary) && story.vocabulary.length > 0
      ? story.vocabulary.map((v) => ({
          word: v.word ?? "",
          meaning: v.meaning ?? "",
          example: v.example ?? "",
        }))
      : null;
  return {
    id: story.id,
    title: story.title,
    description: null,
    thumbnail_url: story.thumbnail.startsWith("http") ? story.thumbnail : story.thumbnail,
    type,
    content: story.content,
    vocabulary: vocab,
    created_at: now,
    updated_at: now,
  };
}

async function main() {
  const rows: Row[] = [
    ...shortStories.map((s) => toRow(s, "short")),
    ...longStories.map((s) => toRow(s, "long")),
    ...categoryStories.map((s) => toRow(s, "category")),
    ...digitalLiteracy.map((s) => toRow(s, "digital")),
  ];

  const { error: contentsError } = await supabase.from("contents").upsert(rows, {
    onConflict: "id",
  });

  if (contentsError) {
    console.error("contents Supabase 오류:", contentsError.message);
    if (contentsError.message.includes("uuid") || contentsError.message.includes("id")) {
      console.error("\n※ contents.id 가 UUID 타입이면 TEXT로 바꿔야 합니다. Supabase SQL 에디터에서:");
      console.error('   ALTER TABLE contents ALTER COLUMN id TYPE text USING id::text;');
      console.error("   (기본키라면 먼저 기본키 제거 후 변경하고 다시 기본키 지정할 수 있습니다.)");
    }
    process.exit(1);
  }

  console.log(`총 ${rows.length}개 콘텐츠를 contents 테이블에 반영했습니다.`);
  console.log("  - short:", shortStories.length);
  console.log("  - long:", longStories.length);
  console.log("  - category:", categoryStories.length);
  console.log("  - digital:", digitalLiteracy.length);

  // 오늘의 단어 → today_words (word 유일 제약이 있으면 upsert, 없으면 insert로 시도)
  const todayWordRows = TODAY_WORD_LIST.map((item) => ({
    word: item.word,
    meaning: item.meaning,
    example: item.example,
    type: item.type,
  }));

  let wordsError = (await supabase.from("today_words").upsert(todayWordRows, { onConflict: "word" })).error;
  if (wordsError?.message?.includes("ON CONFLICT") || wordsError?.message?.includes("unique constraint")) {
    // word 유일 제약이 없으면 insert로 fallback (재실행 시 중복될 수 있음)
    wordsError = (await supabase.from("today_words").insert(todayWordRows)).error;
  }

  if (wordsError) {
    if (wordsError.code === "42P01" || wordsError.message.includes("does not exist")) {
      console.warn("\n※ today_words 테이블이 없어 오늘의 단어는 건너뜁니다. Supabase에 today_words 테이블을 만든 뒤 다시 실행하세요.");
    } else {
      console.warn("\n※ 오늘의 단어 반영 실패:", wordsError.message);
      console.warn("   해결: scripts/README-MIGRATE.md §2-1 (테이블 생성, RLS, unique 제약 등) 참고.");
    }
  } else {
    console.log(`\n오늘의 단어 ${todayWordRows.length}개를 today_words 테이블에 반영했습니다.`);
  }

  // 문해력 기초 퀴즈(핵심 단어 찾기) → core_word_quiz (이미 문항이 있으면 건너뜀)
  const { count: quizCount } = await supabase.from("core_word_quiz").select("*", { count: "exact", head: true });
  const quizRows = CORE_WORD_QUIZ_ITEMS.map((item, index) => ({
    sentence: item.sentence,
    correct_answer: item.correctAnswer,
    selectable_words: item.selectableWords,
    feedback_by_word: item.feedbackByWord,
    sort_order: index + 1,
  }));

  if ((quizCount ?? 0) >= quizRows.length) {
    console.log(`\n핵심 단어 퀴즈는 이미 ${quizCount}개 있어 건너뜁니다.`);
  } else {
    const { error: quizError } = await supabase.from("core_word_quiz").insert(quizRows);
    if (quizError) {
      if (quizError.code === "42P01" || quizError.message.includes("does not exist")) {
        console.warn("\n※ core_word_quiz 테이블이 없어 퀴즈는 건너뜁니다. Supabase에 core_word_quiz 테이블을 만든 뒤 다시 실행하세요.");
      } else {
        console.warn("\n※ 퀴즈 반영 실패:", quizError.message);
        console.warn("   (RLS 정책으로 INSERT가 막혀 있을 수 있습니다. README-MIGRATE.md §3·§4 참고.)");
      }
    } else {
      console.log(`\n핵심 단어 퀴즈 ${quizRows.length}개를 core_word_quiz 테이블에 반영했습니다.`);
    }
  }
}

main();
