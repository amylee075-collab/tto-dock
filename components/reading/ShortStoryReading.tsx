"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { ShortStory } from "@/lib/data";
import { splitContentIntoSentences, splitSentenceByVocabulary } from "@/lib/short-story-utils";
import { useActiveSentence } from "@/lib/hooks/useActiveSentence";
import { useWPM } from "@/lib/hooks/useWPM";
import ShortStoryVocabTooltip from "./ShortStoryVocabTooltip";
import ReadingNavBar from "./ReadingNavBar";
import ReadingSidebar from "./ReadingSidebar";

const SLIDE = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 30 },
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
  /** 제공 시 퀴즈 풀기 클릭 시 이 콜백만 호출 (wpm 전달). 페이지에서 QUIZ 단계로 전환 */
  onGoQuiz?: (wpm: number) => void;
}

export default function ShortStoryReading({
  story,
  onGoQuiz,
}: ShortStoryReadingProps) {
  const { title, content, vocabulary, coreQuiz, readQuizzes } = story;
  const sentences = splitContentIntoSentences(content);

  const [step, setStep] = useState<Step>("READING");
  const [resultWpm, setResultWpm] = useState(0);
  const [coreCorrect, setCoreCorrect] = useState(false);
  const [coreChecked, setCoreChecked] = useState<boolean | null>(null);
  const [coreInput, setCoreInput] = useState("");
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqCorrectCount, setMcqCorrectCount] = useState(0);
  const [mcqFeedback, setMcqFeedback] = useState<"correct" | "wrong" | null>(null);
  const [readingStarted, setReadingStarted] = useState(false);

  const { activeIndex, setActiveIndex, goNext, goPrev } = useActiveSentence(sentences.length);
  const { wpm, status, tier, readCount, updateWPM } = useWPM(
    sentences,
    activeIndex,
    step === "READING",
    readingStarted,
    story.id
  );
  const isOnLastSentence = sentences.length > 0 && activeIndex === sentences.length - 1;

  useEffect(() => {
    if (step === "READING") return;
    window.scrollTo(0, 0);
    const t = setTimeout(() => window.scrollTo(0, 0), 100);
    return () => clearTimeout(t);
  }, [step]);

  const goQuizIntro = () => {
    setResultWpm(wpm);
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

  const currentMcq = readQuizzes[mcqIndex];
  const mcqDone = mcqIndex >= readQuizzes.length;
  const handleMcqSelect = (optionIndex: number) => {
    if (mcqFeedback !== null) return;
    const correct = optionIndex === currentMcq.ans;
    setMcqFeedback(correct ? "correct" : "wrong");
    if (correct) setMcqCorrectCount((c) => c + 1);
  };
  const handleMcqNext = () => {
    setMcqFeedback(null);
    if (mcqIndex + 1 >= readQuizzes.length) {
      setStep("RESULT");
    } else {
      setMcqIndex((i) => i + 1);
    }
  };

  const totalQuiz = 1 + readQuizzes.length;
  const totalCorrect = (coreCorrect ? 1 : 0) + mcqCorrectCount;

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
            {/* 모바일: 상단 접이식 학습 진행률 */}
            <div className="lg:hidden order-1 w-full shrink-0">
              <ReadingSidebar
                wpm={wpm}
                wpmStatus={status}
                tier={tier}
                readCount={readCount}
                totalSentences={sentences.length}
                asAccordion
              />
            </div>
            <article className="flex-1 min-w-0 py-4 lg:py-6 order-2 lg:order-2 relative z-10 max-w-3xl lg:max-w-none">
              <h1 className="font-extrabold text-2xl text-[#212529] mb-6">{title}</h1>
              <div className="pb-[50vh] pb-24">
                <div className="flex flex-col gap-y-8">
                  {sentences.map((sentence, i) => {
                    const segments = splitSentenceByVocabulary(sentence, vocabulary);
                    const isActive = activeIndex === i;
                    return (
                      <div key={i} className="relative">
                        {isActive && (
                          <motion.span
                            layoutId="sentence-highlight-short"
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
                          className={`relative z-10 cursor-pointer text-lg leading-relaxed text-[#212529] py-6 transition-[opacity,filter] duration-200 ${
                            isActive ? "pl-5 -ml-1 font-bold" : "opacity-20 blur-[1px] hover:opacity-40 hover:blur-0"
                          }`}
                          initial={false}
                          aria-current={isActive ? "true" : undefined}
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
                        </motion.p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {step === "READING" && (
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
                  onNext={
                    isOnLastSentence
                      ? (onGoQuiz ? () => onGoQuiz(wpm) : goQuizIntro)
                      : () => {
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
                        }
                  }
                  hasPrev={activeIndex > 0}
                  hasNext={!isOnLastSentence && activeIndex < sentences.length - 1}
                  nextLabel={isOnLastSentence ? "퀴즈 풀기" : "다음"}
                />
              )}
            </article>
            {/* PC: 좌측 고정 학습 진행률 사이드바 */}
            <div className="hidden lg:block lg:order-1 lg:shrink-0">
              <ReadingSidebar
                wpm={wpm}
                wpmStatus={status}
                tier={tier}
                readCount={readCount}
                totalSentences={sentences.length}
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
                  alt="똑똑이"
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
                className="rounded-xl px-8 py-4 font-bold text-white shadow-sm hover:opacity-90 transition-opacity bg-[#ff5700]"
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
            <div className="w-full max-w-xl">
              <h2 className="font-bold text-xl text-[#212529] mb-6">핵심 단어 퀴즈</h2>
              {!coreCorrect ? (
                <>
                  <p className="text-[#212529] font-medium mb-4">{coreQuiz.question}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={coreInput}
                      onChange={(e) => { setCoreInput(e.target.value); setCoreChecked(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleCoreCheck()}
                      placeholder="정답을 입력하세요"
                      className="rounded-lg border border-gray-200 px-4 py-3 text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/50 flex-1 min-w-[200px]"
                    />
                    <button
                      type="button"
                      onClick={handleCoreCheck}
                      className="rounded-xl px-6 py-3 font-bold text-white bg-[#ff5700] hover:opacity-90"
                    >
                      정답 확인
                    </button>
                  </div>
                  {coreChecked === false && (
                    <p className="mt-4 text-red-600 font-medium">아쉬워요. 다시 입력해 보세요.</p>
                  )}
                </>
              ) : (
                <motion.p
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[#ff5700] font-bold text-lg"
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
            <div className="w-full max-w-2xl mx-auto">
              <h2 className="font-bold text-xl text-[#212529] mb-2">독해 퀴즈</h2>
              <p className="text-sm text-gray-500 mb-6">
                {mcqIndex + 1} / {readQuizzes.length}
              </p>
              <p className="text-[#212529] font-medium mb-6">{currentMcq.q}</p>
              <ul className="space-y-3">
                {currentMcq.options.map((opt, optIdx) => (
                  <li key={optIdx}>
                    <button
                      type="button"
                      onClick={() => handleMcqSelect(optIdx)}
                      disabled={mcqFeedback !== null}
                      className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors disabled:opacity-80 ${
                        mcqFeedback === null
                          ? "border-gray-100 hover:border-[#ff5700]/40 hover:bg-[#fff5f0]"
                          : optIdx === currentMcq.ans
                            ? "border-green-500 bg-green-50 text-green-800"
                            : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
              <AnimatePresence mode="wait">
                {mcqFeedback === "correct" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-[#fff5f0] border border-[#ff5700]/20"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ff5700]/30 bg-white">
                      <Image src="/images/character.png" alt="" width={40} height={40} className="w-full h-auto object-contain" />
                    </span>
                    <p className="font-bold text-[#212529]">정답이에요! 똑똑해!</p>
                  </motion.div>
                )}
                {mcqFeedback === "wrong" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-200 bg-white">
                      <Image src="/images/character.png" alt="" width={40} height={40} className="w-full h-auto object-contain opacity-80" />
                    </span>
                    <p className="font-medium text-amber-800">아쉬워요, 다시 한번 읽어볼까요?</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {mcqFeedback !== null && (
                <button
                  type="button"
                  onClick={handleMcqNext}
                  className="mt-6 rounded-xl px-6 py-3 font-bold text-white bg-[#ff5700]"
                >
                  {mcqIndex + 1 < readQuizzes.length ? "다음 문제" : "결과 보기"}
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
                  alt="똑똑이"
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
                  <span className="text-[#ff5700] font-bold">{resultWpm} WPM</span>
                </p>
              </div>
              <Link
                href="/reading/short"
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
