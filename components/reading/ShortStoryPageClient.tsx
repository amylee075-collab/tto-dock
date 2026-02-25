"use client";

import { useState, useEffect } from "react";
import type { ShortStory } from "@/lib/data";
import ShortStoryReading from "./ShortStoryReading";
import ShortStoryQuizContainer from "./ShortStoryQuizContainer";

type PageStep = "READING" | "QUIZ";

interface ShortStoryPageClientProps {
  story: ShortStory;
}

export default function ShortStoryPageClient({
  story,
}: ShortStoryPageClientProps) {
  const [step, setStep] = useState<PageStep>("READING");
  const [resultWpm, setResultWpm] = useState(0);

  if (step === "READING") {
    return (
      <ShortStoryReading
        story={story}
        onGoQuiz={(wpm) => {
          setResultWpm(wpm);
          setStep("QUIZ");
        }}
      />
    );
  }

  return (
    <ShortStoryQuizContainer
      story={story}
      onBack={() => setStep("READING")}
      resultWpm={resultWpm}
    />
  );
}
