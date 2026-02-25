"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ShortStory } from "@/lib/data";
import ConfettiEffect from "./ConfettiEffect";

function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, "").trim();
}

interface ShortStoryQuizContainerProps {
  story: ShortStory;
  onBack: () => void;
  /** 읽기 단계에서 측정한 WPM (결과 화면 표시용) */
  resultWpm?: number;
}

type QuizPhase = "core" | "coreFeedback" | "mcq" | "RESULT";

export default function ShortStoryQuizContainer({
  story,
  onBack,
  resultWpm = 0,
}: ShortStoryQuizContainerProps) {
  const router = useRouter();
  const { title, coreQuiz, readQuizzes } = story;
  const [phase, setPhase] = useState<QuizPhase>("core");
  const [coreInput, setCoreInput] = useState("");
  const [coreChecked, setCoreChecked] = useState<boolean | null>(null);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqFeedback, setMcqFeedback] = useState<"correct" | "wrong" | null>(null);
  const [mcqCorrectCount, setMcqCorrectCount] = useState(0);

  const hasQuizData = coreQuiz && readQuizzes && readQuizzes.length > 0;
  const currentMcq = hasQuizData && phase === "mcq" ? readQuizzes[mcqIndex] : null;
  const totalQuizzes = hasQuizData ? 1 + readQuizzes!.length : 0;
  const totalCorrect = (coreChecked ? 1 : 0) + mcqCorrectCount;

  const handleCoreCheck = () => {
    if (!coreQuiz) return;
    const ok = normalizeAnswer(coreInput) === normalizeAnswer(coreQuiz.answer);
    setCoreChecked(ok);
    if (ok) setPhase("coreFeedback");
  };

  const goToMcq = () => setPhase("mcq");

  const handleMcqSelect = (optionIndex: number) => {
    if (!currentMcq || mcqFeedback !== null) return;
    const correct = optionIndex === currentMcq.ans;
    setMcqFeedback(correct ? "correct" : "wrong");
    if (correct) setMcqCorrectCount((c) => c + 1);
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
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-6">
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
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4 py-12 relative">
        <ConfettiEffect />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md flex flex-col items-center"
        >
          <p className="text-2xl font-extrabold text-[#212529] mb-8 text-center">
            오늘의 학습을 모두 마쳤어요!
          </p>
          <span className="flex h-28 w-28 mb-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#ff5700]/30 bg-[#fff5f0]">
            <Image
              src="/images/character.png"
              alt="똑똑이"
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
              <span className="text-[#ff5700] font-bold">{resultWpm} WPM</span>
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
              onClick={() => router.push("/reading/short")}
              className="rounded-xl px-6 py-3 font-bold text-white bg-[#ff5700] hover:opacity-90 transition-opacity"
            >
              목록으로 돌아가기
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl">
        {/* 헤더 카드 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
          <h1 className="font-extrabold text-xl text-[#212529] mb-1">{title}</h1>
          <p className="text-gray-600 text-sm">독해 실력을 확인해 봐요!</p>
        </div>

        {/* 단계별 퀴즈 카드 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {phase === "core" && (
            <>
              <h2 className="font-bold text-[#212529] mb-4">핵심 단어 퀴즈</h2>
              <p className="text-[#212529] font-medium mb-4">{coreQuiz!.question}</p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={coreInput}
                  onChange={(e) => {
                    setCoreInput(e.target.value);
                    setCoreChecked(null);
                  }}
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
                <p className="mt-4 text-red-600 font-medium text-sm">아쉬워요. 다시 입력해 보세요.</p>
              )}
            </>
          )}

          {phase === "coreFeedback" && (
            <div className="text-center py-4">
              <p className="text-[#ff5700] font-bold text-lg mb-6">정답이에요!</p>
              <button
                type="button"
                onClick={goToMcq}
                className="rounded-xl px-6 py-3 font-bold text-white bg-[#ff5700] hover:opacity-90"
              >
                다음 퀴즈로
              </button>
            </div>
          )}

          {phase === "mcq" && currentMcq ? (
            <>
              <h2 className="font-bold text-[#212529] mb-2">독해 퀴즈</h2>
              <p className="text-sm text-gray-500 mb-4">
                {mcqIndex + 1} / {readQuizzes!.length}
              </p>
              <p className="text-[#212529] font-medium mb-4">{currentMcq.q}</p>
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
              {mcqFeedback === "correct" && (
                <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-[#fff5f0] border border-[#ff5700]/20">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ff5700]/30 bg-white">
                    <Image src="/images/character.png" alt="" width={40} height={40} className="w-full h-auto object-contain" />
                  </span>
                  <p className="font-bold text-[#212529]">정답이에요! 똑똑해!</p>
                </div>
              )}
              {mcqFeedback === "wrong" && (
                <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="font-medium text-amber-800">아쉬워요, 다시 한번 읽어볼까요?</p>
                </div>
              )}
              {mcqFeedback !== null && (
                <button
                  type="button"
                  onClick={handleMcqNext}
                  className="mt-6 rounded-xl px-6 py-3 font-bold text-white bg-[#ff5700]"
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
