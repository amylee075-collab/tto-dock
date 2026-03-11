"use client";

import { useState, useCallback, useRef } from "react";
import type { ShortStory } from "@/lib/data";
import { useUserStatus } from "@/hooks/useUserStatus";
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
}

export default function ShortStoryPageClient({
  story,
  source,
}: ShortStoryPageClientProps) {
  const [step, setStep] = useState<PageStep>("READING");
  const [resultCpm, setResultCpm] = useState(0);
  const goingToQuizRef = useRef(false);
  const { isAuthenticated, saveProgress } = useUserStatus();

  /** 짧은 글 / 긴 글 / 분야별 / 디지털 모두 마이페이지 챌린지에 반영 */
  const isChallengeTracked =
    source === "short" || source === "long" || source === "category" || source === "digital";

  const handleGoQuiz = useCallback(
    async (cpm: number) => {
      if (goingToQuizRef.current) return;
      goingToQuizRef.current = true;
      setResultCpm(cpm);
      setStep("QUIZ");
      setTimeout(() => {
        goingToQuizRef.current = false;
      }, 600);
    },
    []
  );

  const handleComplete = useCallback(
    (payload: QuizCompletePayload) => {
      if (isChallengeTracked && isAuthenticated) {
        const sentences = countSentences(story.content);
        void saveProgress({
          logType: "reading_session",
          contentId: story.id,
          contentType: source ?? "short",
          status: "completed",
          payload: {
            title: story.title,
            source,
            sentencesRead: sentences,
            quizCorrect: payload.quizCorrect,
            quizTotal: payload.quizTotal,
            cpm: payload.cpm,
            summaryFeedback: payload.summaryFeedback,
            thinkingFeedback: payload.thinkingFeedback,
            radarScores: payload.radarScores,
            thinkingNotes: payload.thinkingNotes,
            completed: true,
          },
        });
      }
    },
    [isAuthenticated, isChallengeTracked, saveProgress, source, story.content, story.id, story.title]
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
