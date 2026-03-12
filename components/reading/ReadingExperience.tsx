"use client";

import { useCallback, useEffect, useRef, useState, Fragment } from "react";
import type { ReadingPassage } from "@/lib/data";
import { useCPM } from "@/lib/hooks/useCPM";
import { useActiveSentence } from "@/lib/hooks/useActiveSentence";
import ReadingSidebar from "./ReadingSidebar";
import ReadingNavBar from "./ReadingNavBar";
import ReadingStartOverlay from "./ReadingStartOverlay";

interface ReadingExperienceProps {
  passage: ReadingPassage;
  mode?: "read" | "summary";
}

export default function ReadingExperience({ passage, mode = "read" }: ReadingExperienceProps) {
  const { sentences } = passage;
  const [isActive, setIsActive] = useState(true);
  const [selectedKeySentences, setSelectedKeySentences] = useState<Set<number>>(new Set());
  const [readingStarted, setReadingStarted] = useState(false);

  const { activeIndex, setActiveIndex, goNext, goPrev } = useActiveSentence(sentences.length);
  const { cpm, status, tier, tierLabel, tierMessage, readCount, startReading, updateCPM } = useCPM(
    sentences,
    activeIndex,
    isActive,
    readingStarted,
    passage.id
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

  useEffect(() => {
    if (mode === "read") {
      scrollMainToTop();
      const t = setTimeout(scrollMainToTop, 80);
      return () => clearTimeout(t);
    }
  }, [mode]);

  const didInteractRef = useRef(false);
  useEffect(() => {
    if (!didInteractRef.current && !readingStarted) return;
    didInteractRef.current = true;
    const target = document.querySelector(`[data-sentence-index="${activeIndex}"]`);
    if (target) {
      (target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex, readingStarted]);

  const toggleKeySentence = (i: number) => {
    setSelectedKeySentences((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (mode === "summary") {
    return (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
        <article className="flex-1 min-w-0 py-6 order-1">
          <h1 className="font-extrabold text-2xl text-[#212529] mb-1">
            {passage.title} — 핵심 문장 선택
          </h1>
          <p className="text-sm text-gray-500 mb-6">{passage.summary}</p>
          <p className="text-sm text-ttodock-orange font-medium mb-6">
            문단의 핵심이 되는 문장을 클릭해 선택하세요.
          </p>

          <ul className="space-y-4">
            {sentences.map((sentence, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => toggleKeySentence(i)}
                  className={`w-full text-left text-lg leading-relaxed rounded-xl p-4 transition-all border-2 ${
                    selectedKeySentences.has(i)
                      ? "border-ttodock-orange bg-soft-orange text-[#212529]"
                      : "border-gray-100 bg-white text-[#212529] hover:border-ttodock-orange/40"
                  }`}
                >
                  <span className="mr-2 text-ttodock-orange font-bold">
                    {selectedKeySentences.has(i) ? "✓" : "○"}
                  </span>
                  {sentence}
                </button>
              </li>
            ))}
          </ul>
          {selectedKeySentences.size > 0 && (
            <p className="mt-6 text-sm font-medium text-gray-600">
              {selectedKeySentences.size}개 문장을 핵심 문장으로 선택했어요.
            </p>
          )}
        </article>
        <div className="order-2 lg:shrink-0 lg:sticky lg:top-8 lg:self-start">
          <ReadingSidebar
            cpm={0}
            tier="안정적"
            tierLabel="✅ 안정적"
            tierMessage="좋아요! 내용도 잘 이해하고 있나요?"
            readCount={selectedKeySentences.size}
            totalSentences={sentences.length}
            className="w-full lg:w-64"
          />
        </div>
      </div>
    );
  }

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
        <h1 className="font-reading-title font-extrabold text-2xl md:text-3xl text-[#212529] mb-2">
          {passage.title}
        </h1>
        <p className="text-sm text-gray-500 mb-6">{passage.summary}</p>

        <div className="pb-[var(--reading-nav-bar-height)]">
          <p
            className="font-reading-content text-[#212529] select-text"
            style={{ wordBreak: "keep-all" }}
          >
            {sentences.map((sentence, i) => {
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
                    {sentence}
                  </span>
                </Fragment>
              );
            })}
          </p>
        </div>
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
