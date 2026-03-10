import CoreWordDailyWrapper from "@/components/practice/CoreWordDailyWrapper";

/** 데일리 랜덤 10문제 — revalidate = 0 으로 매일 신선한 세트 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "핵심 단어 찾기 | 또독",
  description:
    "문장에서 핵심 단어를 찾으며 기초 문해력을 향상시켜 보세요.",
};

export default function CoreWordPracticePage() {
  return (
    <div className="core-word-practice w-full max-w-screen-xl mx-auto px-4 md:px-0 mt-6 sm:mt-8 bg-transparent">
      <CoreWordDailyWrapper />
    </div>
  );
}
