"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ShortStory } from "@/lib/data";
import ConfettiEffect from "./ConfettiEffect";

function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, "").trim();
}

export interface QuizCompletePayload {
  quizCorrect: number;
  quizTotal: number;
  cpm: number;
}

interface ShortStoryQuizContainerProps {
  story: ShortStory;
  onBack: () => void;
  /** 읽기 단계에서 측정한 CPM (결과 화면 표시용) */
  resultCpm?: number;
  /** 퀴즈 결과 화면 도달 시 1회 호출 (챌린지 저장 등) */
  onComplete?: (payload: QuizCompletePayload) => void;
  /** 목록으로 돌아가기 링크 (진입 출처에 맞는 목록) */
  listHref?: string;
}

type QuizPhase = "core" | "coreFeedback" | "mcq" | "RESULT";

export default function ShortStoryQuizContainer({
  story,
  onBack,
  resultCpm = 0,
  onComplete,
  listHref = "/reading/short",
}: ShortStoryQuizContainerProps) {
  const router = useRouter();
  const { title, coreQuiz, readQuizzes } = story;
  const [phase, setPhase] = useState<QuizPhase>("core");
  const [coreInput, setCoreInput] = useState("");
  const [coreChecked, setCoreChecked] = useState<boolean | null>(null);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqFeedback, setMcqFeedback] = useState<"correct" | "wrong" | null>(null);
  const [mcqCorrectCount, setMcqCorrectCount] = useState(0);
  const completedFired = useRef(false);

  const hasQuizData = coreQuiz && readQuizzes && readQuizzes.length > 0;
  const currentMcq = hasQuizData && phase === "mcq" ? readQuizzes[mcqIndex] : null;
  const totalQuizzes = hasQuizData ? 1 + readQuizzes!.length : 0;
  const totalCorrect = (coreChecked ? 1 : 0) + mcqCorrectCount;

  useEffect(() => {
    if (phase === "RESULT" && hasQuizData && onComplete && !completedFired.current) {
      completedFired.current = true;
      onComplete({
        quizCorrect: totalCorrect,
        quizTotal: totalQuizzes,
        cpm: resultCpm,
      });
    }
  }, [phase, hasQuizData, totalCorrect, totalQuizzes, resultCpm, onComplete]);

  /** 현재 문항 번호 (1-based). core=1, mcq=2,3,... */
  const currentStepIndex =
    phase === "core" || phase === "coreFeedback" ? 1 : mcqIndex + 2;

  const handleCoreCheck = () => {
    if (!coreQuiz) return;
    const ok = normalizeAnswer(coreInput) === normalizeAnswer(coreQuiz.answer);
    setCoreChecked(ok);
    if (ok) setPhase("coreFeedback");
  };

  /** [모르겠어요] SKIP: 오답 처리 후 다음으로 (주관식) */
  const handleCoreSkip = () => {
    if (!coreQuiz) return;
    setCoreChecked(false);
    setPhase("coreFeedback");
  };

  const goToMcq = () => setPhase("mcq");

  const handleMcqSelect = (optionIndex: number) => {
    if (!currentMcq || mcqFeedback !== null) return;
    const correct = optionIndex === currentMcq.ans;
    setMcqFeedback(correct ? "correct" : "wrong");
    if (correct) setMcqCorrectCount((c) => c + 1);
  };

  /** [모르겠어요] SKIP: 오답 처리 후 정답 노출, 다음 문항으로 */
  const handleMcqSkip = () => {
    if (!currentMcq || mcqFeedback !== null) return;
    setMcqFeedback("wrong");
    // mcqCorrectCount는 증가하지 않음 (오답 처리)
  };

  const handleMcqNext = () => {
    setMcqFeedback(null);
    const isLastMcq = mcqIndex >= (readQuizzes?.length ?? 1) - 1;
    if (isLastMcq) {
      setPhase("RESULT");
    } else {
      setMcqIndex((i) => i + 1);
    }
  };

  if (!hasQuizData) {
    return (
      <div className="w-full bg-white flex flex-col items-center p-6 py-12">
        <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-sm text-center">
          <p className="text-gray-600 mb-6">퀴즈 데이터를 불러올 수 없습니다.</p>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl px-6 py-3 font-semibold text-[#212529] border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            이전으로
          </button>
        </div>
      </div>
    );
  }

  if (phase === "RESULT" && hasQuizData) {
    return (
      <div className="w-full bg-white flex flex-col items-center p-4 py-12 relative">
        <ConfettiEffect />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[1000px] flex flex-col items-center"
        >
          <p className="text-2xl font-extrabold text-[#212529] mb-8 text-center">
            오늘의 학습을 모두 마쳤어요!
          </p>
          <span className="flex h-28 w-28 mb-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#ff5700]/30 bg-[#fff5f0]">
            <Image
              src="/images/character.png"
              alt="또독이"
              width={112}
              height={112}
              className="w-full h-auto object-contain object-top"
            />
          </span>
          <div className="w-full rounded-2xl border border-gray-100 bg-gray-50/80 p-6 shadow-sm mb-8 space-y-4">
            <p className="font-medium text-[#212529]">
              퀴즈 맞춘 개수{" "}
              <span className="text-[#ff5700] font-bold">
                {totalCorrect} / {totalQuizzes}
              </span>
            </p>
            <p className="font-medium text-[#212529]">
              읽기 속도{" "}
              <span className="text-[#ff5700] font-bold">{resultCpm} 글자 / 분</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl px-6 py-3 font-semibold text-[#212529] border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              다시 복습하기
            </button>
            <button
              type="button"
              onClick={() => router.push(listHref)}
              className="rounded-xl px-6 py-3 font-bold text-white bg-[#ff5700] hover:opacity-90 transition-opacity"
            >
              목록으로 돌아가기
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const progressPercent =
    totalQuizzes > 0 ? (currentStepIndex / totalQuizzes) * 100 : 0;

  return (
    <div className="w-full bg-white flex flex-col items-center p-4 py-10 md:py-12">
      <div className="w-full max-w-[1000px]">
        {/* 진행률 표시기 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xl font-semibold text-[#212529] mb-2">
            <span>
              {currentStepIndex} / {totalQuizzes}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#ff5700]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 헤더 카드 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm mb-6">
          <h1 className="font-extrabold text-3xl text-[#212529] mb-1">{title}</h1>
          <p className="text-gray-600 text-xl">독해 실력을 확인해 봐요!</p>
        </div>

        {/* 단계별 퀴즈 카드 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
          {phase === "core" && (
            <>
              <h2 className="font-bold text-3xl text-[#212529] mb-4">핵심 단어 퀴즈</h2>
              <p className="text-[#212529] font-medium text-xl mb-6">{coreQuiz!.question}</p>
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <input
                  type="text"
                  value={coreInput}
                  onChange={(e) => {
                    setCoreInput(e.target.value);
                    setCoreChecked(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleCoreCheck()}
                  placeholder="정답을 입력하세요"
                  className="rounded-xl border-2 border-gray-200 px-5 py-4 text-xl text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/50 focus:border-[#ff5700] flex-1 min-w-0 min-h-[3.5rem]"
                />
                <div className="flex flex-row sm:flex-row gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCoreCheck}
                    className="rounded-xl px-6 py-4 min-h-[3.5rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all flex-1 sm:flex-none"
                  >
                    정답 확인
                  </button>
                  <button
                    type="button"
                    onClick={handleCoreSkip}
                    className="rounded-xl px-5 py-4 min-h-[3.5rem] font-bold text-gray-600 border-2 border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all flex-1 sm:flex-none"
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
          )}

          {phase === "coreFeedback" && (
            <div className="text-center py-6">
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`font-bold text-xl mb-2 ${coreChecked ? "text-[#ff5700]" : "text-amber-700"}`}
              >
                {coreChecked ? "정답이에요!" : "정답을 확인해 볼까요?"}
              </motion.p>
              {coreChecked === false && coreQuiz && (
                <p className="text-lg text-gray-700 mb-6">
                  정답: <span className="font-bold text-[#212529]">{coreQuiz.answer}</span>
                </p>
              )}
              <button
                type="button"
                onClick={goToMcq}
                className="rounded-xl px-8 py-4 min-h-[3.25rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all"
              >
                다음 퀴즈로
              </button>
            </div>
          )}

          {phase === "mcq" && currentMcq ? (
            <>
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
              {mcqFeedback === "correct" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
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
                  className="mt-6 flex flex-col gap-2 p-5 rounded-xl bg-amber-50 border border-amber-200"
                >
                  <p className="font-medium text-xl text-amber-800">아쉬워요. 정답을 확인해 볼까요?</p>
                  <p className="text-lg text-amber-900">
                    정답: <span className="font-bold">{currentMcq.options[currentMcq.ans]}</span>
                  </p>
                </motion.div>
              )}
              {mcqFeedback !== null && (
                <button
                  type="button"
                  onClick={handleMcqNext}
                  className="mt-6 rounded-xl px-8 py-4 min-h-[3.25rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all text-lg"
                >
                  {mcqIndex + 1 < readQuizzes!.length ? "다음 문제" : "결과 보기"}
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
