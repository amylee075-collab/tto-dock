import { dailyWordQuiz } from "@/lib/data";
import HeroWordQuiz from "@/components/dashboard/HeroWordQuiz";
import TodayLearningCards from "@/components/dashboard/TodayLearningCards";
import FreeLearningCards from "@/components/dashboard/FreeLearningCards";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col gap-8">
      <HeroWordQuiz quiz={dailyWordQuiz} />
      <TodayLearningCards />
      <FreeLearningCards />
    </div>
  );
}
