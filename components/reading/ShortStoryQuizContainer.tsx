"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import type { ShortStory } from "@/lib/data";
import ConfettiEffect from "./ConfettiEffect";

function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, "").trim();
}

/** Fisher–Yates 셔플 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

type QuizPhase = "core" | "coreFeedback" | "mcq" | "summary" | "summaryResult" | "RESULT";

export default function ShortStoryQuizContainer({
  story,
  onBack,
  resultCpm = 0,
  onComplete,
  listHref = "/reading/short",
}: ShortStoryQuizContainerProps) {
  const router = useRouter();
  const { title, coreQuiz, readQuizzes, summaryQuiz } = story;
  const [phase, setPhase] = useState<QuizPhase>("core");
  const [coreInput, setCoreInput] = useState("");
  const [coreChecked, setCoreChecked] = useState<boolean | null>(null);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqFeedback, setMcqFeedback] = useState<"correct" | "wrong" | null>(null);
  const [mcqCorrectCount, setMcqCorrectCount] = useState(0);
  const [summaryText, setSummaryText] = useState("");
  const completedFired = useRef(false);

  const hasCoreQuiz = !!(coreQuiz && (coreQuiz.question || coreQuiz.answer || coreQuiz.sentence));
  const hasMcq = Array.isArray(readQuizzes) && readQuizzes.length > 0;
  const hasSummary = !!summaryQuiz;
  const hasQuizData = hasCoreQuiz;
  const totalQuizzes =
    1 +
    (readQuizzes?.length ?? 0) +
    (hasSummary ? 1 : 0);
  const currentMcq = hasMcq && phase === "mcq" ? readQuizzes[mcqIndex] : null;
  const totalCorrect = (coreChecked ? 1 : 0) + mcqCorrectCount;

  /** 현재 MCQ 보기 셔플 순서 (표시 순서 → 원본 인덱스) */
  const shuffledOrder = useMemo(() => {
    if (!currentMcq?.options?.length) return [];
    return shuffle(currentMcq.options.map((_, i) => i));
  }, [mcqIndex, currentMcq?.q]);

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

  /** 현재 문항 번호 (1-based). core=1, mcq=2..n, summary=n+1 */
  const currentStepIndex =
    phase === "core" || phase === "coreFeedback"
      ? 1
      : phase === "mcq"
        ? 2 + mcqIndex
        : phase === "summary" || phase === "summaryResult"
          ? totalQuizzes
          : 1;

  /** 유사 정답 포함 띄어쓰기 무시 매칭 */
  const handleCoreCheck = () => {
    if (!coreQuiz) return;
    const normalized = normalizeAnswer(coreInput);
    const ok =
      normalized === normalizeAnswer(coreQuiz.answer) ||
      (Array.isArray(coreQuiz.similarAnswers) &&
        coreQuiz.similarAnswers.some((a) => normalizeAnswer(a) === normalized));
    setCoreChecked(ok);
    if (ok) setPhase("coreFeedback");
  };

  const handleCoreSkip = () => {
    if (!coreQuiz) return;
    setCoreChecked(false);
    setPhase("coreFeedback");
  };

  const goToMcq = () => {
    if (hasMcq) setPhase("mcq");
    else if (hasSummary) setPhase("summary");
    else setPhase("RESULT");
  };

  const handleMcqSelect = (displayedIndex: number) => {
    if (!currentMcq || mcqFeedback !== null) return;
    const originalAnsIndex = shuffledOrder[displayedIndex];
    const correct = originalAnsIndex === currentMcq.ans;
    setMcqFeedback(correct ? "correct" : "wrong");
    if (correct) setMcqCorrectCount((c) => c + 1);
  };

  const handleMcqSkip = () => {
    if (!currentMcq || mcqFeedback !== null) return;
    setMcqFeedback("wrong");
  };

  const handleMcqNext = () => {
    setMcqFeedback(null);
    const isLastMcq = mcqIndex >= (readQuizzes?.length ?? 1) - 1;
    if (isLastMcq) {
      if (hasSummary) setPhase("summary");
      else setPhase("RESULT");
    } else {
      setMcqIndex((i) => i + 1);
    }
  };

  const handleSummarySubmit = () => {
    setPhase("summaryResult");
  };

  const goToResult = () => setPhase("RESULT");

  const summaryCharLimit =
    (summaryQuiz?.charLimitByGrade && typeof summaryQuiz.charLimitByGrade === "object" &&
      Object.keys(summaryQuiz.charLimitByGrade).length > 0)
      ? Number((summaryQuiz.charLimitByGrade as Record<string, number>)["4"]) ||
        Number((summaryQuiz.charLimitByGrade as Record<string, number>)["3"]) ||
        Object.values(summaryQuiz.charLimitByGrade as Record<string, number>)[0]
      : 200;
  const radarData = [
    { subject: "이해력", value: 75, fullMark: 100 },
    { subject: "사고력", value: 82, fullMark: 100 },
    { subject: "표현력", value: 88, fullMark: 100 },
  ];

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
          <p className="text-2xl font-extrabold text-[#212529] mb-4 text-center">
            오늘의 학습을 모두 마쳤어요!
          </p>
          <p className="text-gray-600 text-center whitespace-pre-line mb-8">
            {"준비된 또독 단어 퀴즈가 모두 끝났습니다.\n내일 다시 도전해 봐요!"}
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
          {phase === "core" && coreQuiz && (
            <>
              <h2 className="font-bold text-3xl text-[#212529] mb-4">핵심 단어 퀴즈</h2>
              <p className="text-[#212529] font-medium text-xl mb-6">
                {coreQuiz.sentence ? (
                  <>
                    {(() => {
                      const sent = coreQuiz.sentence;
                      const ans = (coreQuiz.answer ?? "").trim();
                      const idx = ans ? sent.indexOf(ans) : -1;
                      if (idx === -1) return sent;
                      return (
                        <>
                          {sent.slice(0, idx)}
                          <span className="inline-flex min-w-[2rem] items-center justify-center rounded border-2 border-[#F97316] bg-[#F97316] px-2 py-1 text-white font-bold">?</span>
                          {sent.slice(idx + ans.length)}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  coreQuiz.question
                )}
              </p>
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
                {hasMcq ? "다음 퀴즈로" : hasSummary ? "요약하기로" : "결과 보기"}
              </button>
            </div>
          )}

          {phase === "mcq" && currentMcq && shuffledOrder.length > 0 ? (
            <>
              <h2 className="font-bold text-3xl text-[#212529] mb-2">독해 퀴즈</h2>
              <p className="text-[#212529] font-medium text-xl mb-6">{currentMcq.q}</p>
              <ul className="space-y-4">
                {shuffledOrder.map((origIdx, displayedIdx) => (
                  <li key={origIdx}>
                    <button
                      type="button"
                      onClick={() => handleMcqSelect(displayedIdx)}
                      disabled={mcqFeedback !== null}
                      className={`w-full text-left rounded-xl border-2 px-5 py-4 text-xl transition-all disabled:opacity-80 min-h-[3.5rem] ${
                        mcqFeedback === null
                          ? "border-gray-100 hover:border-[#ff5700]/40 hover:bg-[#fff5f0]"
                          : origIdx === currentMcq.ans
                            ? "border-green-500 bg-green-50 text-green-800"
                            : mcqFeedback === "wrong" && origIdx === currentMcq.ans
                              ? "border-green-500 bg-green-50 text-green-800"
                              : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      {currentMcq.options[origIdx]}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 min-h-[180px] flex flex-col justify-end">
                {mcqFeedback === null && (
                  <button
                    type="button"
                    onClick={handleMcqSkip}
                    className="rounded-xl px-5 py-3 font-bold text-gray-600 border-2 border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all w-fit"
                  >
                    모르겠어요
                  </button>
                )}
                {mcqFeedback === "correct" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-5 rounded-xl bg-[#fff5f0] border border-[#ff5700]/20"
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
                    className="flex flex-col gap-2 p-5 rounded-xl bg-amber-50 border border-amber-200"
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
                    {mcqIndex + 1 < (readQuizzes?.length ?? 0) ? "다음 문제" : hasSummary ? "요약하기로" : "결과 보기"}
                  </button>
                )}
              </div>
            </>
          ) : null}

          {phase === "summary" && (
            <>
              <h2 className="font-bold text-3xl text-[#212529] mb-4">요약하기</h2>
              <p className="text-[#212529] font-medium text-lg mb-2">글을 읽고 요약해 보세요.</p>
              <div className="mb-2 text-gray-600 text-sm">
                글자 수: <span className="font-bold text-[#212529]">{summaryText.length}</span>
                {summaryCharLimit ? ` / ${summaryCharLimit}` : ""}
              </div>
              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                placeholder="요약 내용을 입력하세요"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-[#212529] min-h-[160px] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/50 focus:border-[#ff5700] resize-y"
                maxLength={summaryCharLimit || undefined}
              />
              <button
                type="button"
                onClick={handleSummarySubmit}
                className="mt-6 rounded-xl px-8 py-4 min-h-[3.25rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all"
              >
                제출하기
              </button>
            </>
          )}

          {phase === "summaryResult" && (
            <div className="py-4">
              <h2 className="font-bold text-3xl text-[#212529] mb-4">요약 결과</h2>
              <p className="text-[#212529] font-medium text-lg mb-6">이해력·사고력·표현력을 확인해 보세요.</p>
              <div className="h-[280px] w-full max-w-md mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#212529", fontSize: 14 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#6b7280" }} />
                    <Radar name="점수" dataKey="value" stroke="#F97316" fill="#F97316" fillOpacity={0.5} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <button
                type="button"
                onClick={goToResult}
                className="mt-8 rounded-xl px-8 py-4 min-h-[3.25rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all"
              >
                결과 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
