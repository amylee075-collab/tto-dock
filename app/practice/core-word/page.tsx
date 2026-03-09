import CoreWordPractice from "@/components/practice/CoreWordPractice";
import { getCoreWordQuizFromSupabase } from "@/lib/core-word-quiz-from-supabase";
import { CORE_WORD_QUIZ_ITEMS } from "@/lib/coreWordPractice";

/** 정적 배포 방지·캐시 미사용 — 문해력 기초 훈련(핵심 단어) 어드민 수정 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "핵심 단어 찾기 | 또독",
  description:
    "문장에서 핵심 단어를 찾으며 기초 문해력을 향상시켜 보세요.",
};

export default async function CoreWordPracticePage() {
  const fromSupabase = await getCoreWordQuizFromSupabase();
  const items = fromSupabase.length > 0 ? fromSupabase : CORE_WORD_QUIZ_ITEMS;

  return (
    <div className="core-word-practice w-full max-w-screen-xl mx-auto px-4 md:px-0 mt-6 sm:mt-8 bg-transparent">
      <CoreWordPractice items={items} />
    </div>
  );
}
