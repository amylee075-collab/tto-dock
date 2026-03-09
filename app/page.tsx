import HeroWordQuiz from "@/components/dashboard/HeroWordQuiz";
import TodayWordQuizCard from "@/components/dashboard/TodayWordQuizCard";
import HomeTodayLearningSection from "@/components/dashboard/HomeTodayLearningSection";
import HomeFreeLearningSection from "@/components/dashboard/HomeFreeLearningSection";
import { getTodayWordsFromSupabase } from "@/lib/today-words-from-supabase";
import { TODAY_WORD_LIST } from "@/lib/todayWordList";
import { getRandomRecommendedReading } from "@/lib/data";

/** 정적 배포 방지·캐시 미사용 — 오늘의 단어 등 어드민 수정 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const fromSupabase = await getTodayWordsFromSupabase();
  const wordList = fromSupabase.length > 0 ? fromSupabase : TODAY_WORD_LIST;
  const todaySeed = new Date().toISOString().slice(0, 10);
  const recommended = getRandomRecommendedReading();

  return (
    <div className="w-full min-w-0 max-w-[1280px] mx-auto flex flex-col gap-0 px-4 md:px-6">
      {/* 1. 오늘의 단어 몰입 - 단독 카드 */}
      <section
        id="today-word-immersion"
        className="scroll-mt-24 w-full py-8 md:py-10"
        aria-label="오늘의 단어와 단어 퀴즈"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
            <div className="md:w-1/2 flex">
              <HeroWordQuiz wordList={wordList} variant="inline" className="w-full" />
            </div>
            <div className="hidden md:block w-px bg-gray-200 rounded-full" aria-hidden />
            <div className="md:w-1/2 flex pt-4 md:pt-0 border-t md:border-t-0 md:border-none border-gray-100 md:border-transparent">
              <TodayWordQuizCard
                wordList={wordList}
                todaySeed={todaySeed}
                variant="inline"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. 오늘의 학습 - 추천형 (3카드 가로) */}
      <section
        id="today-learning-wrap"
        className="w-full border-t border-gray-100 py-10 md:py-12"
        aria-label="오늘의 학습"
      >
        <HomeTodayLearningSection
          wordList={wordList}
          todaySeed={todaySeed}
          recommended={recommended}
        />
      </section>

      {/* 3. 자유 학습 - 4카드 나열 */}
      <section
        id="free-learning-wrap"
        className="w-full border-t border-gray-100 py-10 md:py-12"
        aria-label="자유 학습"
      >
        <HomeFreeLearningSection />
      </section>
    </div>
  );
}
