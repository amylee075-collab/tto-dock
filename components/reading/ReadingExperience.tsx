"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ReadingPassage } from "@/lib/data";
import { useWPM } from "@/lib/hooks/useWPM";
import { useActiveSentence } from "@/lib/hooks/useActiveSentence";
import ReadingSidebar from "./ReadingSidebar";
import ReadingNavBar from "./ReadingNavBar";

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
  const { wpm, status, tier, updateWPM } = useWPM(
    sentences,
    activeIndex,
    isActive,
    readingStarted,
    passage.id
  );

  const scrollMainToTop = () => {
    const el = document.getElementById("main-scroll-area");
    if (el) el.scrollTo({ top: 0, left: 0 });
  };

  useEffect(() => {
    scrollMainToTop();
  }, []);

  useEffect(() => {
    if (mode === "read") {
      scrollMainToTop();
      const t = setTimeout(scrollMainToTop, 50);
      return () => clearTimeout(t);
    }
  }, [mode]);

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
            wpm={0}
            tier="보통"
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
          wpm={wpm}
          wpmStatus={status}
          tier={tier}
          readCount={activeIndex + 1}
          totalSentences={sentences.length}
          asAccordion
        />
      </div>
      <article className="flex-1 min-w-0 pt-6 pb-4 lg:py-6 order-2 lg:order-1 relative z-10 max-w-3xl lg:max-w-none">
        <h1 className="font-extrabold text-2xl text-[#212529] mb-1">
          {passage.title}
        </h1>
        <p className="text-sm text-gray-500 mb-8">{passage.summary}</p>

        <div className="pb-[var(--reading-nav-bar-height)]">
          <div className="flex flex-col gap-y-4">
            {sentences.map((sentence, i) => {
              const isActiveSentence = activeIndex === i;
              return (
                <div key={i} className="relative">
                  {isActiveSentence && (
                    <motion.span
                      layoutId="sentence-highlight-passage"
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
                      isActiveSentence ? "pl-5 -ml-1 font-bold" : "opacity-20 blur-[1px] hover:opacity-40 hover:blur-0"
                    }`}
                    initial={false}
                    aria-current={isActiveSentence ? "true" : undefined}
                  >
                    {sentence}
                  </motion.p>
                </div>
              );
            })}
          </div>
        </div>
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
