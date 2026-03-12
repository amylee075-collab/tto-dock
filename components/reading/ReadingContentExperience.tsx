"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from "react";
import type { ReadingContent } from "@/lib/data";
import { useCPM } from "@/lib/hooks/useCPM";
import { useActiveSentence } from "@/lib/hooks/useActiveSentence";
import type { Segment as VocabSegment, VocabItem } from "@/lib/vocabulary-split";
import ReadingSidebar from "./ReadingSidebar";
import ReadingNavBar from "./ReadingNavBar";
import ReadingStartOverlay from "./ReadingStartOverlay";
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
  const { cpm, status, tier, tierLabel, tierMessage, readCount, startReading, updateCPM } = useCPM(
    sentences,
    activeIndex,
    true,
    readingStarted,
    content.id
  );

  const handleStartReading = useCallback(() => {
    setReadingStarted(true);
    setActiveIndex(0);
    startReading(0);
  }, [setActiveIndex, startReading]);

  const scrollMainToTop = () => {
    const el = document.getElementById("main-scroll-area");
    if (el) el.scrollTo({ top: 0, left: 0 });
  };

  useEffect(() => {
    scrollMainToTop();
    const t = setTimeout(scrollMainToTop, 80);
    return () => clearTimeout(t);
  }, []);

  const didInteractRef = useRef(false);
  useEffect(() => {
    if (!didInteractRef.current && !readingStarted) return;
    didInteractRef.current = true;
    const target = document.querySelector(`[data-sentence-index="${activeIndex}"]`);
    if (target) {
      (target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex, readingStarted]);

  useEffect(() => {
    if (!readingStarted || !endSentinelRef.current || showQuiz) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setShowQuiz(true);
      },
      { threshold: 0.2 }
    );
    ob.observe(endSentinelRef.current);
    return () => ob.disconnect();
  }, [readingStarted, showQuiz]);

  const sentenceSegments = useMemo((): VocabSegment[][] => {
    const vocabList = (vocabulary ?? []) as VocabItem[];
    if (!vocabList.length) {
      return sentences.map((s) => [{ type: "text", value: s }]);
    }

    // 긴 단어 우선 + 첫 등장만 강조(중복 제거)
    const sorted = [...vocabList].sort((a, b) => b.word.length - a.word.length);
    const renderedWords = new Set<string>();

    const splitFirstOnly = (sentence: string): VocabSegment[] => {
      const segments: VocabSegment[] = [];
      let remaining = sentence;

      while (remaining.length > 0) {
        let found = false;
        for (const item of sorted) {
          const idx = remaining.indexOf(item.word);
          if (idx !== -1) {
            if (idx > 0) segments.push({ type: "text", value: remaining.slice(0, idx) });

            if (renderedWords.has(item.word)) {
              segments.push({ type: "text", value: item.word });
            } else {
              segments.push({ type: "vocab", item, value: item.word });
              renderedWords.add(item.word);
            }

            remaining = remaining.slice(idx + item.word.length);
            found = true;
            break;
          }
        }
        if (!found) {
          segments.push({ type: "text", value: remaining });
          break;
        }
      }

      return segments;
    };

    return sentences.map(splitFirstOnly);
  }, [sentences, vocabulary]);

  const hasQuiz = quizzes && quizzes.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 w-full">
      <div className="lg:hidden order-1 w-full shrink-0 sticky top-0 z-20 bg-white">
        <ReadingSidebar
          cpm={cpm}
          tier={tier}
          tierLabel={tierLabel}
          tierMessage={tierMessage}
          cpmStatus={status}
          readCount={readCount}
          totalSentences={sentences.length}
          readingStarted={readingStarted}
          asAccordion
        />
      </div>
      <article className="flex-1 min-w-0 pt-6 pb-4 lg:py-6 order-2 lg:order-1 relative z-10 w-full max-w-3xl lg:max-w-4xl">
        <ReadingStartOverlay visible={!readingStarted} onStart={handleStartReading} />
        <h1 className="font-reading-title font-extrabold text-2xl md:text-3xl text-[#212529] mb-6">
          {title}
        </h1>

        <div className="pb-[var(--reading-nav-bar-height)]">
          <p
            className="font-reading-content text-[#212529] select-text"
            style={{ wordBreak: "keep-all" }}
          >
            {sentences.map((sentence, i) => {
              const segments =
                sentenceSegments[i] ?? [{ type: "text" as const, value: sentence }];
              const isActive = readingStarted && activeIndex === i;
              const isRead = readingStarted && i < activeIndex;
              return (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!readingStarted) return;
                      setActiveIndex(i);
                    }}
                    onKeyDown={(e) => {
                      if (!readingStarted) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveIndex(i);
                      }
                    }}
                    data-sentence-index={i}
                    aria-current={isActive ? "true" : undefined}
                    className={`cursor-pointer inline rounded-[3px] px-0.5 -mx-0.5 transition-[background-color,color,opacity] duration-300 ease-out ${
                      isActive
                        ? "bg-[#ff5700]/20 text-[#212529] font-semibold"
                        : isRead
                          ? "text-gray-400"
                          : "text-gray-300 opacity-50"
                    }`}
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
                  </span>
                </Fragment>
              );
            })}
          </p>
        </div>

        <div ref={endSentinelRef} className="h-20" aria-hidden />

        {!showQuiz && (
          <ReadingNavBar
            onPrev={() => {
              if (!readingStarted) return;
              updateCPM();
              goPrev();
              updateCPM();
            }}
            onNext={() => {
              if (!readingStarted) return;
              updateCPM();
              goNext();
              updateCPM();
            }}
            locked={!readingStarted}
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
            cpm={cpm}
            tier={tier}
            quizCorrect={quizCorrect}
            quizTotal={quizTotal}
          />
        )}
      </article>

      <div className="hidden lg:block lg:order-2 lg:shrink-0 lg:sticky lg:top-8 lg:self-start">
        <ReadingSidebar
          cpm={cpm}
          tier={tier}
          tierLabel={tierLabel}
          tierMessage={tierMessage}
          cpmStatus={status}
          readCount={readCount}
          totalSentences={sentences.length}
          readingStarted={readingStarted}
          className="w-full lg:w-64 lg:max-w-[16rem]"
        />
      </div>
    </div>
  );
}
