"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ReadingContent } from "@/lib/data";
import { useWPM } from "@/lib/hooks/useWPM";
import { useActiveSentence } from "@/lib/hooks/useActiveSentence";
import { splitByVocabulary } from "@/lib/vocabulary-split";
import ReadingSidebar from "./ReadingSidebar";
import ReadingNavBar from "./ReadingNavBar";
import VocabularyTooltip from "./VocabularyTooltip";
import QuizSection from "./QuizSection";
import CoachingFeedback from "./CoachingFeedback";

interface ReadingContentExperienceProps {
  content: ReadingContent;
}

export default function ReadingContentExperience({
  content,
}: ReadingContentExperienceProps) {
  const { type, title, sentences, vocabulary, quizzes } = content;
  const endSentinelRef = useRef<HTMLDivElement>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [readingStarted, setReadingStarted] = useState(false);

  const { activeIndex, setActiveIndex, goNext, goPrev } = useActiveSentence(sentences.length);
  const { wpm, status, tier, updateWPM } = useWPM(
    sentences,
    activeIndex,
    true,
    readingStarted,
    content.id
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!endSentinelRef.current || showQuiz) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setShowQuiz(true);
      },
      { threshold: 0.2 }
    );
    ob.observe(endSentinelRef.current);
    return () => ob.disconnect();
  }, [showQuiz]);

  const renderSentenceWithVocabulary = (sentence: string, i: number) => {
    const segments = vocabulary?.length
      ? splitByVocabulary(sentence, vocabulary)
      : [{ type: "text" as const, value: sentence }];
    const isActive = activeIndex === i;

    return (
      <div key={i} className="relative">
        {isActive && (
          <motion.span
            layoutId="sentence-highlight-content"
            className="absolute left-0 top-0 bottom-0 w-1 rounded-r bg-[#ff5700]"
            style={{ width: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            aria-hidden
          />
        )}
        <motion.p
          layout
          role="button"
          tabIndex={0}
          onClick={(e) => {
            setReadingStarted(true);
            setActiveIndex(i);
            (e.currentTarget as HTMLElement).scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setReadingStarted(true);
              setActiveIndex(i);
              (e.currentTarget as HTMLElement).scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }}
          data-sentence-index={i}
          className={`relative z-10 cursor-pointer text-xl md:text-[1.5rem] leading-relaxed text-[#212529] py-3 transition-[opacity,filter] duration-200 ${
            isActive ? "pl-5 -ml-1 font-bold" : "opacity-20 blur-[1px] hover:opacity-40 hover:blur-0"
          }`}
          initial={false}
          aria-current={isActive ? "true" : undefined}
        >
          {segments.map((seg, j) =>
            seg.type === "text" ? (
              <span key={j}>{seg.value}</span>
            ) : (
              <VocabularyTooltip
                key={j}
                word={seg.item.word}
                meaning={seg.item.meaning}
                type={seg.item.type}
              >
                {seg.value}
              </VocabularyTooltip>
            )
          )}
        </motion.p>
      </div>
    );
  };

  const hasQuiz = quizzes && quizzes.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 w-full">
      <div className="lg:hidden order-1 w-full shrink-0">
        <ReadingSidebar
          wpm={wpm}
          wpmStatus={status}
          tier={tier}
          readCount={activeIndex + 1}
          totalSentences={sentences.length}
          asAccordion
        />
      </div>
      <article className="flex-1 min-w-0 py-4 lg:py-6 order-2 lg:order-1 relative z-10 max-w-3xl lg:max-w-none">
        <h1 className="font-extrabold text-2xl text-[#212529] mb-2">
          {title}
        </h1>

        <div className="pb-20">
          <div className="flex flex-col gap-y-4">
            {sentences.map((s, i) => renderSentenceWithVocabulary(s, i))}
          </div>
        </div>

        <div ref={endSentinelRef} className="h-20" aria-hidden />

        {!showQuiz && (
          <ReadingNavBar
            onPrev={() => {
              setReadingStarted(true);
              updateWPM();
              const prevIndex = Math.max(activeIndex - 1, 0);
              goPrev();
              setTimeout(() => {
                document.querySelector(`[data-sentence-index="${prevIndex}"]`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                updateWPM();
              }, 0);
            }}
            onNext={() => {
              setReadingStarted(true);
              updateWPM();
              const nextIndex = Math.min(activeIndex + 1, sentences.length - 1);
              goNext();
              setTimeout(() => {
                document.querySelector(`[data-sentence-index="${nextIndex}"]`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                updateWPM();
              }, 0);
            }}
            hasPrev={activeIndex > 0}
            hasNext={activeIndex < sentences.length - 1}
          />
        )}

        {showQuiz && hasQuiz && !quizDone && (
          <QuizSection
            quizzes={quizzes}
            onComplete={(correct, total) => {
              setQuizCorrect(correct);
              setQuizTotal(total);
              setQuizDone(true);
            }}
          />
        )}

        {quizDone && (
          <CoachingFeedback
            wpm={wpm}
            tier={tier}
            quizCorrect={quizCorrect}
            quizTotal={quizTotal}
          />
        )}
      </article>

      <div className="hidden lg:block lg:order-2 lg:shrink-0 lg:sticky lg:top-8 lg:self-start">
        <ReadingSidebar
          wpm={wpm}
          wpmStatus={status}
          tier={tier}
          readCount={activeIndex + 1}
          totalSentences={sentences.length}
          className="w-full lg:w-64 lg:max-w-[16rem]"
        />
      </div>
    </div>
  );
}
