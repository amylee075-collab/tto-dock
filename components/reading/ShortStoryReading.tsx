"use client";

import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { ShortStory } from "@/lib/data";
import { splitContentIntoSentences } from "@/lib/short-story-utils";
import type { ShortStorySegment } from "@/lib/short-story-utils";
import { useActiveSentence } from "@/lib/hooks/useActiveSentence";
import { useCPM } from "@/lib/hooks/useCPM";
import ShortStoryVocabTooltip from "./ShortStoryVocabTooltip";
import ReadingNavBar from "./ReadingNavBar";
import ReadingSidebar from "./ReadingSidebar";
import ReadingStartOverlay from "./ReadingStartOverlay";

const SLIDE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

/** 퀴즈/결과 단계: 슬라이드 없이 페이드만 사용해 뷰포트 상단에 바로 노출되도록 함 */
const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

type Step = "READING" | "QUIZ_INTRO" | "CORE_QUIZ" | "READING_QUIZ" | "RESULT";

function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, "").trim();
}

interface ShortStoryReadingProps {
  story: ShortStory;
  /** 제공 시 퀴즈 풀기 클릭 시 이 콜백만 호출 (cpm 전달). 페이지에서 QUIZ 단계로 전환 */
  onGoQuiz?: (cpm: number) => void;
  /** 목록으로 돌아가기 링크 (진입 출처에 맞는 목록) */
  listHref?: string;
}

export default function ShortStoryReading({
  story,
  onGoQuiz,
  listHref = "/reading/short",
}: ShortStoryReadingProps) {
  const { title, content, vocabulary, coreQuiz, readQuizzes } = story;
  const sentences = splitContentIntoSentences(content);

  const sentenceSegments = useMemo((): ShortStorySegment[][] => {
    if (!vocabulary?.length) {
      return sentences.map((s) => [{ type: "text", value: s }]);
    }

    // 긴 단어 우선 + 첫 등장만 강조(중복 제거)
    const sorted = [...vocabulary].sort((a, b) => b.word.length - a.word.length);
    const renderedWords = new Set<string>();

    const splitFirstOnly = (sentence: string): ShortStorySegment[] => {
      const segments: ShortStorySegment[] = [];
      let remaining = sentence;

      while (remaining.length > 0) {
        let found = false;
        for (const item of sorted) {
          const idx = remaining.indexOf(item.word);
          if (idx !== -1) {
            if (idx > 0) {
              segments.push({ type: "text", value: remaining.slice(0, idx) });
            }

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

  const [step, setStep] = useState<Step>("READING");
  const [resultCpm, setResultCpm] = useState(0);
  const [coreCorrect, setCoreCorrect] = useState(false);
  const [coreSkipped, setCoreSkipped] = useState(false);
  const [coreChecked, setCoreChecked] = useState<boolean | null>(null);
  const [coreInput, setCoreInput] = useState("");
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqCorrectCount, setMcqCorrectCount] = useState(0);
  const [mcqFeedback, setMcqFeedback] = useState<"correct" | "wrong" | null>(null);
  const [readingStarted, setReadingStarted] = useState(false);

  const { activeIndex, setActiveIndex, goNext, goPrev } = useActiveSentence(sentences.length);
  const { cpm, status, tier, tierLabel, tierMessage, readCount, startReading, updateCPM } = useCPM(
    sentences,
    activeIndex,
    step === "READING",
    readingStarted,
    story.id
  );
  const isOnLastSentence = sentences.length > 0 && activeIndex === sentences.length - 1;

  const handleStartReading = () => {
    setReadingStarted(true);
    setActiveIndex(0);
    startReading(0);
  };

  const scrollMainToTop = () => {
    const el = document.getElementById("main-scroll-area");
    if (el) el.scrollTo({ top: 0, left: 0 });
  };

  useEffect(() => {
    if (step === "READING") {
      scrollMainToTop();
      const t = setTimeout(scrollMainToTop, 80);
      return () => clearTimeout(t);
    }
    scrollMainToTop();
    const t = setTimeout(scrollMainToTop, 100);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    scrollMainToTop();
    const t = setTimeout(scrollMainToTop, 80);
    return () => clearTimeout(t);
  }, []);

  const didInteractRef = useRef(false);
  useEffect(() => {
    if (step !== "READING" || !didInteractRef.current && !readingStarted) return;
    didInteractRef.current = true;
    const target = document.querySelector(`[data-sentence-index="${activeIndex}"]`);
    if (target) {
      (target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex, readingStarted, step]);

  const goQuizIntro = () => {
    setResultCpm(cpm);
    setStep("QUIZ_INTRO");
  };

  const goCoreQuiz = () => setStep("CORE_QUIZ");
  const handleCoreCheck = () => {
    const ok = normalizeAnswer(coreInput) === normalizeAnswer(coreQuiz.answer);
    setCoreChecked(ok);
    if (ok) {
      setCoreCorrect(true);
      setTimeout(() => setStep("READING_QUIZ"), 800);
    }
  };
  const handleCoreSkip = () => {
    setCoreCorrect(false);
    setCoreChecked(false);
    setCoreSkipped(true);
  };
  const goToReadingQuiz = () => {
    setCoreSkipped(false);
    setStep("READING_QUIZ");
  };

  const safeReadQuizzes = Array.isArray(readQuizzes) ? readQuizzes : [];
  const currentMcq = safeReadQuizzes[mcqIndex];
  const mcqDone = mcqIndex >= safeReadQuizzes.length;
  const handleMcqSelect = (optionIndex: number) => {
    if (mcqFeedback !== null) return;
    const correct = optionIndex === currentMcq.ans;
    setMcqFeedback(correct ? "correct" : "wrong");
    if (correct) setMcqCorrectCount((c) => c + 1);
  };
  const handleMcqSkip = () => {
    if (mcqFeedback !== null) return;
    setMcqFeedback("wrong");
  };
  const handleMcqNext = () => {
    setMcqFeedback(null);
    if (mcqIndex + 1 >= safeReadQuizzes.length) {
      setStep("RESULT");
    } else {
      setMcqIndex((i) => i + 1);
    }
  };

  const totalQuiz = 1 + safeReadQuizzes.length;
  const totalCorrect = (coreCorrect ? 1 : 0) + mcqCorrectCount;
  const quizProgressIndex = step === "CORE_QUIZ" ? 1 : step === "READING_QUIZ" ? mcqIndex + 2 : 1;
  const quizProgressPercent = totalQuiz > 0 ? (quizProgressIndex / totalQuiz) * 100 : 0;

  return (
    <div className="min-h-screen w-full">
      <AnimatePresence mode="wait">
        {/* ---------- READING ---------- */}
        {step === "READING" && (
          <motion.div
            key="READING"
            initial={SLIDE.initial}
            animate={SLIDE.animate}
            exit={SLIDE.exit}
            transition={SLIDE.transition}
            className="flex flex-col lg:flex-row gap-0 lg:gap-8 w-full min-h-[80vh]"
          >
            {/* 모바일: 상단 접이식 학습 진행률 (sticky) */}
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
              <h1 className="font-reading-title font-extrabold text-2xl md:text-3xl text-[#212529] mb-6">{title}</h1>
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
                              <ShortStoryVocabTooltip key={j} item={seg.item}>
                                {seg.value}
                              </ShortStoryVocabTooltip>
                            )
                          )}
                        </span>
                      </Fragment>
                    );
                  })}
                </p>
              </div>
              {step === "READING" && (
                <ReadingNavBar
                  onPrev={() => {
                    if (!readingStarted) return;
                    updateCPM();
                    goPrev();
                    updateCPM();
                  }}
                  onNext={
                    isOnLastSentence
                      ? (onGoQuiz ? () => onGoQuiz(cpm) : goQuizIntro)
                      : () => {
                          if (!readingStarted) return;
                          updateCPM();
                          goNext();
                          updateCPM();
                        }
                  }
                  locked={!readingStarted}
                  hasPrev={activeIndex > 0}
                  hasNext={!isOnLastSentence && activeIndex < sentences.length - 1}
                  nextLabel={isOnLastSentence ? "퀴즈 풀기" : "다음"}
                />
              )}
            </article>
            {/* PC: 우측 고정 학습 진행률 사이드바 */}
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
          </motion.div>
        )}

        {/* ---------- QUIZ_INTRO ---------- */}
        {step === "QUIZ_INTRO" && (
          <motion.div
            key="QUIZ_INTRO"
            initial={FADE.initial}
            animate={FADE.animate}
            exit={FADE.exit}
            transition={FADE.transition}
            className="w-full min-h-[80vh] flex flex-col items-center justify-center py-12 px-4"
          >
            <div className="max-w-md text-center">
              <span className="flex h-20 w-20 mx-auto items-center justify-center overflow-hidden rounded-full border-2 border-[#ff5700]/30 bg-[#fff5f0] mb-6">
                <Image
                  src="/images/character.png"
                  alt="또독이"
                  width={80}
                  height={80}
                  className="w-full h-auto object-contain object-top"
                />
              </span>
              <h2 className="font-extrabold text-2xl text-[#212529] mb-2">
                잘 읽었어요!
              </h2>
              <p className="text-gray-600 mb-8">
                이제 퀴즈를 풀어 보며 내용을 확인해 볼까요?
              </p>
              <button
                type="button"
                onClick={goCoreQuiz}
                className="min-h-[48px] rounded-xl px-8 py-4 font-bold text-white shadow-sm hover:opacity-90 transition-opacity bg-[#ff5700] active:scale-[0.98] touch-manipulation"
                style={{ touchAction: "manipulation" }}
              >
                퀴즈 시작
              </button>
            </div>
          </motion.div>
        )}

        {/* ---------- CORE_QUIZ (주관식만) ---------- */}
        {step === "CORE_QUIZ" && (
          <motion.div
            key="CORE_QUIZ"
            initial={FADE.initial}
            animate={FADE.animate}
            exit={FADE.exit}
            transition={FADE.transition}
            className="w-full min-h-[80vh] flex flex-col items-center justify-center py-12 px-4"
          >
            <div className="w-full max-w-[1000px]">
              <div className="flex items-center justify-between text-xl font-semibold text-[#212529] mb-2">
                <span>1 / {totalQuiz}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-6">
                <motion.div
                  className="h-full rounded-full bg-[#ff5700]"
                  initial={{ width: 0 }}
                  animate={{ width: `${quizProgressPercent}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
              <h2 className="font-bold text-3xl text-[#212529] mb-6">핵심 단어 퀴즈</h2>
              {coreSkipped ? (
                <div className="text-center py-4">
                  <p className="text-amber-700 font-bold text-xl mb-2">정답을 확인해 볼까요?</p>
                  <p className="text-xl text-gray-700 mb-6">
                    정답: <span className="font-bold text-[#212529]">{coreQuiz.answer}</span>
                  </p>
                  <button
                    type="button"
                    onClick={goToReadingQuiz}
                    className="rounded-xl px-8 py-4 min-h-[3.25rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all"
                  >
                    다음 퀴즈로
                  </button>
                </div>
              ) : !coreCorrect ? (
                <>
                  <p className="text-[#212529] font-medium text-xl mb-6">{coreQuiz.question}</p>
                  <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    <input
                      type="text"
                      value={coreInput}
                      onChange={(e) => { setCoreInput(e.target.value); setCoreChecked(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleCoreCheck()}
                      placeholder="정답을 입력하세요"
                      className="rounded-xl border-2 border-gray-200 px-5 py-4 text-xl text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/50 focus:border-[#ff5700] flex-1 min-w-0 min-h-[3.5rem]"
                    />
                    <div className="flex flex-row gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleCoreCheck}
                        className="rounded-xl px-6 py-4 min-h-[3.25rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all"
                      >
                        정답 확인
                      </button>
                      <button
                        type="button"
                        onClick={handleCoreSkip}
                        className="rounded-xl px-5 py-4 min-h-[3.25rem] font-bold text-gray-600 border-2 border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all"
                      >
                        모르겠어요
                      </button>
                    </div>
                  </div>
                  {coreChecked === false && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-red-600 font-medium text-lg"
                    >
                      아쉬워요. 다시 입력해 보세요.
                    </motion.p>
                  )}
                </>
              ) : (
                <motion.p
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[#ff5700] font-bold text-xl"
                >
                  정답이에요! 다음 퀴즈로 넘어갑니다...
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* ---------- READING_QUIZ (객관식만) ---------- */}
        {step === "READING_QUIZ" && !mcqDone && currentMcq && (
          <motion.div
            key="READING_QUIZ"
            initial={FADE.initial}
            animate={FADE.animate}
            exit={FADE.exit}
            transition={FADE.transition}
            className="w-full min-h-[80vh] flex flex-col justify-center py-12 px-4"
          >
            <div className="w-full max-w-[1000px] mx-auto">
              <div className="flex items-center justify-between text-xl font-semibold text-[#212529] mb-2">
                <span>{mcqIndex + 2} / {totalQuiz}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-6">
                <motion.div
                  className="h-full rounded-full bg-[#ff5700]"
                  initial={{ width: 0 }}
                  animate={{ width: `${quizProgressPercent}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
              <h2 className="font-bold text-3xl text-[#212529] mb-2">독해 퀴즈</h2>
              <p className="text-[#212529] font-medium text-xl mb-6">{currentMcq.q}</p>
              <ul className="space-y-4">
                {currentMcq.options.map((opt, optIdx) => (
                  <li key={optIdx}>
                    <button
                      type="button"
                      onClick={() => handleMcqSelect(optIdx)}
                      disabled={mcqFeedback !== null}
                      className={`w-full text-left rounded-xl border-2 px-5 py-4 text-xl transition-all disabled:opacity-80 min-h-[3.5rem] ${
                        mcqFeedback === null
                          ? "border-gray-100 hover:border-[#ff5700]/40 hover:bg-[#fff5f0]"
                          : optIdx === currentMcq.ans
                            ? "border-green-500 bg-green-50 text-green-800"
                            : mcqFeedback === "wrong" && optIdx === currentMcq.ans
                              ? "border-green-500 bg-green-50 text-green-800"
                              : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
              {mcqFeedback === null && (
                <button
                  type="button"
                  onClick={handleMcqSkip}
                  className="mt-4 rounded-xl px-5 py-3 font-bold text-gray-600 border-2 border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  모르겠어요
                </button>
              )}
              <AnimatePresence mode="wait">
                {mcqFeedback === "correct" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 flex items-center gap-3 p-5 rounded-xl bg-[#fff5f0] border border-[#ff5700]/20"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ff5700]/30 bg-white">
                      <Image src="/images/character.png" alt="" width={48} height={48} className="w-full h-auto object-contain" />
                    </span>
                    <p className="font-bold text-xl text-[#212529]">정답이에요! 똑똑해!</p>
                  </motion.div>
                )}
                {mcqFeedback === "wrong" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 flex flex-col gap-2 p-5 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <p className="font-medium text-xl text-amber-800">아쉬워요. 정답을 확인해 볼까요?</p>
                    <p className="text-lg text-amber-900">
                      정답: <span className="font-bold">{currentMcq.options[currentMcq.ans]}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              {mcqFeedback !== null && (
                <button
                  type="button"
                  onClick={handleMcqNext}
                  className="mt-6 rounded-xl px-8 py-4 min-h-[3.25rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all text-lg"
                >
                  {mcqIndex + 1 < safeReadQuizzes.length ? "다음 문제" : "결과 보기"}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ---------- RESULT ---------- */}
        {step === "RESULT" && (
          <motion.div
            key="RESULT"
            initial={FADE.initial}
            animate={FADE.animate}
            exit={FADE.exit}
            transition={FADE.transition}
            className="w-full min-h-[80vh] flex flex-col items-center justify-center py-12 px-4"
          >
            <div className="max-w-md w-full text-center">
              <span className="flex h-24 w-24 mx-auto items-center justify-center overflow-hidden rounded-full border-2 border-[#ff5700]/30 bg-[#fff5f0] mb-8">
                <Image
                  src="/images/character.png"
                  alt="또독이"
                  width={96}
                  height={96}
                  className="w-full h-auto object-contain object-top"
                />
              </span>
              <h2 className="font-extrabold text-2xl text-[#212529] mb-6">
                학습 완료!
              </h2>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6 text-left space-y-4">
                <p className="font-medium text-[#212529]">
                  퀴즈 맞춘 개수{" "}
                  <span className="text-[#ff5700] font-bold">
                    {totalCorrect} / {totalQuiz}
                  </span>
                </p>
                <p className="font-medium text-[#212529]">
                  읽기 속도{" "}
                  <span className="text-[#ff5700] font-bold">{resultCpm} 글자 / 분</span>
                </p>
              </div>
              <Link
                href={listHref}
                className="inline-flex items-center justify-center rounded-xl px-8 py-4 font-bold text-white bg-[#ff5700] hover:opacity-90 transition-opacity"
              >
                목록으로 돌아가기
              </Link>
            </div>
          </motion.div>
        )}

        {/* READING_QUIZ → RESULT 직행 시 (mcqDone이면 RESULT만 보이므로, 마지막 문제에서 "결과 보기" 클릭 시 step이 RESULT로 바뀜. 그런데 step === "READING_QUIZ" && !mcqDone 조건이라 mcqDone이 true가 되면 이 블록이 안 그려짐. 그 순간 step이 RESULT로 바뀌므로 RESULT 블록이 그려짐. 다만 "READING_QUIZ" step일 때 마지막 문제를 풀고 "결과 보기"를 누르면 setStep("RESULT")가 되고, mcqDone은 아직 mcqIndex + 1 >= length로 체크한 뒤 setStep만 했으므로 mcqIndex는 마지막 인덱스. 다음 렌더에서 step === RESULT라서 RESULT 화면이 나옴. OK.) */}
      </AnimatePresence>
    </div>
  );
}
