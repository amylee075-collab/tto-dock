"use client";

import { useState, useCallback, useRef } from "react";
import type { ShortStory } from "@/lib/data";
import { addReadingResult, addQuizResult } from "@/lib/challenge-storage";
import ShortStoryReading from "./ShortStoryReading";
import ShortStoryQuizContainer from "./ShortStoryQuizContainer";
import type { QuizCompletePayload } from "./ShortStoryQuizContainer";

type PageStep = "READING" | "QUIZ";
export type StorySource = "short" | "category" | "digital";

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
}

export default function ShortStoryPageClient({
  story,
  source,
}: ShortStoryPageClientProps) {
  const [step, setStep] = useState<PageStep>("READING");
  const [resultWpm, setResultWpm] = useState(0);
  const goingToQuizRef = useRef(false);

  /** 짧은 글 / 분야별 / 디지털 모두 마이페이지 챌린지에 반영 */
  const isChallengeTracked =
    source === "short" || source === "category" || source === "digital";

  const handleGoQuiz = useCallback(
    async (wpm: number) => {
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
      setResultWpm(wpm);
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
        addQuizResult(payload.quizCorrect, payload.quizTotal, payload.wpm);
      }
    },
    [isChallengeTracked]
  );

  if (step === "READING") {
    return (
      <ShortStoryReading
        story={story}
        onGoQuiz={handleGoQuiz}
      />
    );
  }

  return (
    <ShortStoryQuizContainer
      story={story}
      onBack={() => setStep("READING")}
      resultWpm={resultWpm}
      onComplete={isChallengeTracked ? handleComplete : undefined}
    />
  );
}
