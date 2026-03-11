import HeroWordQuiz from "@/components/dashboard/HeroWordQuiz";
import TodayWordQuizCard from "@/components/dashboard/TodayWordQuizCard";
import HomeTodayLearningSection from "@/components/dashboard/HomeTodayLearningSection";
import { getTodayWordsFromSupabase } from "@/lib/today-words-from-supabase";
import { getQuizWordsFromSupabase } from "@/lib/quiz-words-from-supabase";
import { TODAY_WORD_LIST } from "@/lib/todayWordList";
import { getRandomRecommendedReadingFromSupabase } from "@/lib/content-from-supabase";

/** 정적 배포 방지·캐시 미사용 — 오늘의 단어 등 어드민 수정 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** 오늘 날짜 시드로 한 개의 인덱스 결정 — 메인 상단에 노출할 '오늘의 단어' 1개 */
function getFeaturedWordIndex(wordListLength: number, dateSeed: string): number {
  if (wordListLength <= 0) return 0;
  let h = 0;
  for (let i = 0; i < dateSeed.length; i++) h = (h * 31 + dateSeed.charCodeAt(i)) >>> 0;
  return h % wordListLength;
}

export default async function HomePage() {
  const fromSupabase = await getTodayWordsFromSupabase();
  const wordList = fromSupabase.length > 0 ? fromSupabase : TODAY_WORD_LIST;
  const todaySeed = new Date().toISOString().slice(0, 10);
  const recommended = await getRandomRecommendedReadingFromSupabase();
  const featuredIndex = getFeaturedWordIndex(wordList.length, todaySeed);
  const featuredWord = wordList[featuredIndex] ?? null;
  /** 퀴즈에서 제외: 상단에 강조된 단어 딱 1개만. 전체 리스트 제외 금지 → 나머지 99개로 퀴즈 3개 생성 */
  const excludeWords = featuredWord ? [featuredWord.word] : [];
  const { quizItems, optionPool } = await getQuizWordsFromSupabase(excludeWords);

  const supabaseUrlPreview =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 10)
      : "(unset)";

  return (
    <div className="w-full min-w-0 max-w-[1280px] mx-auto flex flex-col gap-0 px-0 relative">
      {/* [디버그] Vercel이 바라보는 DB 확인용 — NEXT_PUBLIC_SUPABASE_URL 앞 10글자 */}
      <div
        className="fixed bottom-4 right-4 z-50 rounded bg-black/80 text-white px-2 py-1 text-xs font-mono"
        aria-hidden
      >
        env: {supabaseUrlPreview}
      </div>
      {/* 1. 오늘의 단어 몰입 - 단독 카드 */}
      <section
        id="today-word-immersion"
        className="scroll-mt-24 w-full py-6 md:py-8"
        aria-label="오늘의 단어와 단어 퀴즈"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch min-h-0">
            <div className="md:basis-2/5 md:max-w-[40%] flex flex-1 min-h-0 flex-col">
              <HeroWordQuiz
                wordList={wordList}
                featuredWord={featuredWord}
                variant="inline"
                className="w-full h-full flex flex-col min-h-0"
              />
            </div>
            <div className="hidden md:block w-px bg-gray-200 rounded-full shrink-0" aria-hidden />
            <div className="md:basis-3/5 md:max-w-[60%] flex flex-1 min-h-0 flex-col pt-4 md:pt-0 border-t md:border-t-0 md:border-none border-gray-100 md:border-transparent">
              <TodayWordQuizCard
                quizItems={quizItems}
                optionPool={optionPool}
                variant="inline"
                className="w-full h-full flex flex-col min-h-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. 오늘의 학습 - 추천형 (3카드 가로) */}
      <section
        id="today-learning-wrap"
        className="w-full border-t border-gray-100 py-6 md:py-8"
        aria-label="오늘의 학습"
      >
        <HomeTodayLearningSection
          wordList={wordList}
          todaySeed={todaySeed}
          recommended={recommended}
        />
      </section>
    </div>
  );
}
