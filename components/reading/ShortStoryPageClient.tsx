"use client";

import { useState, useCallback, useRef } from "react";
import type { ShortStory } from "@/lib/data";
import { addReadingResult, addQuizResult } from "@/lib/challenge-storage";
import ShortStoryReading from "./ShortStoryReading";
import ShortStoryQuizContainer from "./ShortStoryQuizContainer";
import QuizErrorBoundary from "./QuizErrorBoundary";
import type { QuizCompletePayload } from "./ShortStoryQuizContainer";

type PageStep = "READING" | "QUIZ";
export type StorySource = "short" | "long" | "category" | "digital";

function countSentences(content: string): number {
  const trimmed = content.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.length || 1;
}

interface ShortStoryPageClientProps {
  story: ShortStory;
  /** 분야별/디지털일 때만 챌린지 저장 */
  source?: StorySource;
  /** 퀴즈 바로 진입 등 초기 단계 제어 */
  initialStep?: PageStep;
}

export default function ShortStoryPageClient({
  story,
  source,
  initialStep,
}: ShortStoryPageClientProps) {
  const [step, setStep] = useState<PageStep>(initialStep ?? "READING");
  const [resultCpm, setResultCpm] = useState(0);
  const goingToQuizRef = useRef(false);

  /** 짧은 글 / 긴 글 / 분야별 / 디지털 모두 마이페이지 챌린지에 반영 */
  const isChallengeTracked =
    source === "short" || source === "long" || source === "category" || source === "digital";

  const handleGoQuiz = useCallback(
    async (cpm: number) => {
      if (goingToQuizRef.current) return;
      goingToQuizRef.current = true;
      try {
        if (isChallengeTracked) {
          const sentences = countSentences(story.content);
          addReadingResult(sentences);
        }
      } catch {
        // 저장 실패해도 퀴즈 페이지로는 진입
      }
      setResultCpm(cpm);
      setStep("QUIZ");
      setTimeout(() => {
        goingToQuizRef.current = false;
      }, 600);
    },
    [isChallengeTracked, story.content]
  );

  const handleComplete = useCallback(
    (payload: QuizCompletePayload) => {
      if (isChallengeTracked) {
        addQuizResult(payload.quizCorrect, payload.quizTotal, payload.cpm);
      }
    },
    [isChallengeTracked]
  );

  /** 진입 출처에 맞는 목록 URL (목록으로 돌아가기용) */
  const listHref =
    source === "category"
      ? "/reading/category"
      : source === "digital"
        ? "/reading/digital"
        : source === "long"
          ? "/reading/long"
          : "/reading/short";

  if (step === "READING") {
    return (
      <ShortStoryReading
        story={story}
        onGoQuiz={handleGoQuiz}
        listHref={listHref}
      />
    );
  }

  return (
    <QuizErrorBoundary onBack={() => setStep("READING")}>
      <ShortStoryQuizContainer
        story={story}
        onBack={() => setStep("READING")}
        resultCpm={resultCpm}
        onComplete={isChallengeTracked ? handleComplete : undefined}
        listHref={listHref}
      />
    </QuizErrorBoundary>
  );
}
