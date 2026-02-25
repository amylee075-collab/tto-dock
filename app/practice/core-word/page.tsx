import CoreWordPractice from "@/components/practice/CoreWordPractice";

export const metadata = {
  title: "핵심 단어 찾기 | 또독",
  description:
    "문장에서 핵심 단어를 찾으며 기초 문해력을 향상시켜 보세요.",
};

export default function CoreWordPracticePage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <CoreWordPractice />
    </div>
  );
}
