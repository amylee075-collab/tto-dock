"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import type { ShortStory } from "@/lib/data";
import { getCPMTier } from "@/lib/hooks/useCPM";
import { buildLearningReportComment } from "@/lib/report-comment-builder";

function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, "").trim();
}

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(safeSeconds / 60);
  const ss = safeSeconds % 60;
  return `${String(mm).padStart(2, "0")}분 ${String(ss).padStart(2, "0")}초`;
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

function countIncludedKeywords(answer: string, keywords: string[] = []): number {
  const normalizedAnswer = answer.trim();
  if (!normalizedAnswer) return 0;
  return keywords.filter((keyword) => keyword && normalizedAnswer.includes(keyword)).length;
}

function calculateSentenceVarietyScore(answers: string[]): number {
  const sentences = answers
    .flatMap((answer) =>
      answer
        .split(/[.!?\n]+/)
        .map((part) => part.trim())
        .filter(Boolean)
    );

  if (sentences.length === 0) return 0;

  const uniqueSentences = new Set(sentences.map((sentence) => sentence.replace(/\s+/g, " ")));
  const uniqueRatio = uniqueSentences.size / sentences.length;
  const sentenceCountBonus = Math.min(sentences.length, 4) * 12;
  return Math.min(100, Math.round(uniqueRatio * 55 + sentenceCountBonus));
}

function calculateThinkingNoteQuality(
  averageSummaryLength: number,
  summaryKeywordCount: number,
  sentenceVarietyScore: number
): number {
  const lengthScore = Math.min(100, Math.round(averageSummaryLength * 0.9));
  const keywordScore = Math.min(100, summaryKeywordCount * 18);
  return Math.min(
    100,
    Math.round(lengthScore * 0.45 + keywordScore * 0.25 + sentenceVarietyScore * 0.3)
  );
}

export interface QuizCompletePayload {
  quizCorrect: number;
  quizTotal: number;
  cpm: number;
  summaryFeedback?: string;
  thinkingFeedback?: string;
  radarScores?: {
    vocabulary: number;
    understanding: number;
    thinking: number;
    expression: number;
  };
  thinkingNotes?: Array<{
    question: string;
    userAnswer: string;
    modelAnswer?: string;
  }>;
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
  storySource?: "short" | "long" | "category" | "digital";
}

type QuizPhase = "core" | "coreFeedback" | "mcq" | "summary" | "RESULT";

export default function ShortStoryQuizContainer({
  story,
  onBack,
  resultCpm = 0,
  onComplete,
  listHref = "/reading/short",
  storySource = "short",
}: ShortStoryQuizContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { title, coreQuiz, readQuizzes, summaryQuiz } = story;
  const summaryItems = Array.isArray(summaryQuiz)
    ? summaryQuiz
    : summaryQuiz
      ? [summaryQuiz]
      : [];
  const [phase, setPhase] = useState<QuizPhase>("core");
  const [coreInput, setCoreInput] = useState("");
  const [coreChecked, setCoreChecked] = useState<boolean | null>(null);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqFeedback, setMcqFeedback] = useState<"correct" | "wrong" | null>(null);
  const [mcqCorrectCount, setMcqCorrectCount] = useState(0);
  const [summaryText, setSummaryText] = useState("");
  const [summaryAnswers, setSummaryAnswers] = useState<string[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const completedFired = useRef(false);

  const hasCoreQuiz = !!(coreQuiz && (coreQuiz.question || coreQuiz.answer || coreQuiz.sentence));
  const hasMcq = Array.isArray(readQuizzes) && readQuizzes.length > 0;
  const hasSummary = summaryItems.length > 0;
  const hasQuizData = hasCoreQuiz;
  const totalSummaryCount = summaryItems.length;
  const totalMcqCount = readQuizzes?.length ?? 0;
  const totalActivities =
    1 + // core
    totalMcqCount +
    totalSummaryCount;
  const totalObjectiveQuizzes = 1 + totalMcqCount;
  const currentMcq = hasMcq && phase === "mcq" ? readQuizzes[mcqIndex] : null;
  const totalCorrect = (coreChecked ? 1 : 0) + mcqCorrectCount;
  const hasSummaryResult = summaryAnswers.some((answer) => answer?.trim().length > 0);
  const averageSummaryLength =
    summaryAnswers.filter(Boolean).reduce((sum, answer) => sum + answer.length, 0) /
    Math.max(summaryAnswers.filter(Boolean).length, 1);
  const vocabularyScore = coreChecked ? 88 : 72;
  const understandingScore =
    totalMcqCount > 0 ? Math.round((mcqCorrectCount / totalMcqCount) * 100) : 80;
  const thinkingScore = hasSummaryResult
    ? Math.min(100, 68 + Math.floor(averageSummaryLength / 3))
    : 70;
  const expressionScore = hasSummaryResult
    ? Math.min(100, 65 + Math.floor(averageSummaryLength / 2.5))
    : 68;
  const summaryKeywordCount = summaryItems.reduce(
    (sum, item, idx) =>
      sum + countIncludedKeywords(summaryAnswers[idx] ?? "", item.requiredKeywords ?? []),
    0
  );
  const sentenceVarietyScore = calculateSentenceVarietyScore(summaryAnswers);
  const thinkingNoteQuality = calculateThinkingNoteQuality(
    averageSummaryLength,
    summaryKeywordCount,
    sentenceVarietyScore
  );
  const reportRadarData = [
    { subject: "어휘력", value: vocabularyScore, fullMark: 100 },
    { subject: "이해력", value: understandingScore, fullMark: 100 },
    { subject: "사고력", value: thinkingScore, fullMark: 100 },
    { subject: "표현력", value: expressionScore, fullMark: 100 },
  ];
  const thinkingFeedback =
    thinkingScore >= 90
      ? "생각을 깊게 확장해서 자신의 의견을 또렷하게 표현했어요. 핵심 내용과 나의 생각이 잘 연결된 훌륭한 글쓰기였어요."
      : thinkingScore >= 80
        ? "글의 내용을 바탕으로 자신의 생각을 자연스럽게 덧붙였어요. 예시 답안과 비교하며 근거를 조금 더 자세히 써 보면 더 좋아질 거예요."
        : "질문을 잘 읽고 끝까지 답안을 작성했어요. 다음에는 왜 그렇게 생각했는지 이유를 한두 문장 더 보태면 사고력이 더 잘 드러나요.";
  const thinkingNotes = summaryItems.map((item, idx) => ({
    question: item.question ?? `요약 문항 ${idx + 1}`,
    userAnswer: summaryAnswers[idx] ?? "",
    modelAnswer: item.modelAnswer || item.exampleAnswer || "",
  }));
  const reportContentType =
    storySource === "long"
      ? "long_story"
      : storySource === "short"
        ? "short_story"
        : storySource;
  const reportComment = useMemo(
    () =>
      buildLearningReportComment({
        contentType: reportContentType,
        readingCpm: resultCpm,
        readingDurationSec:
          resultCpm > 0 ? Math.round((story.content.replace(/\s+/g, "").length / resultCpm) * 60) : 0,
        quizCorrect: totalCorrect,
        quizTotal: totalObjectiveQuizzes,
        passageChars: story.content.replace(/\s+/g, "").length,
        coreWordCorrect: coreChecked === true,
        synonymRecognition: coreChecked === true,
        vocabContextAccuracy: totalMcqCount > 0 ? Math.round((mcqCorrectCount / totalMcqCount) * 100) : 0,
        readingQuizAccuracy: totalMcqCount > 0 ? Math.round((mcqCorrectCount / totalMcqCount) * 100) : 0,
        summaryLength: averageSummaryLength,
        summaryKeywordCount,
        summarySentenceVariety: sentenceVarietyScore,
        inferenceAccuracy: totalMcqCount > 0 ? Math.round((mcqCorrectCount / totalMcqCount) * 100) : 0,
        thinkingNoteQuality,
      }),
    [
      averageSummaryLength,
      coreChecked,
      mcqCorrectCount,
      reportContentType,
      resultCpm,
      sentenceVarietyScore,
      story.content,
      summaryKeywordCount,
      thinkingNoteQuality,
      totalCorrect,
      totalMcqCount,
      totalObjectiveQuizzes,
    ]
  );
  const showDetailedReport = reportComment.hasDetailedFeedback;
  const showSummaryAnalysis = showDetailedReport && summaryItems.length > 0;
  const detailedFeedbackItems = [
    reportComment.vocabularyFeedback
      ? { label: "어휘력", feedback: reportComment.vocabularyFeedback }
      : null,
    reportComment.comprehensionFeedback
      ? { label: "이해력", feedback: reportComment.comprehensionFeedback }
      : null,
    reportComment.expressionFeedback
      ? { label: "표현력", feedback: reportComment.expressionFeedback }
      : null,
    reportComment.thinkingFeedback
      ? { label: "사고력", feedback: reportComment.thinkingFeedback }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    feedback: {
      good: string;
      improve: string;
      tip: string;
    };
  }>;

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
        quizTotal: totalObjectiveQuizzes,
        cpm: resultCpm,
        summaryFeedback: reportComment.summaryComment,
        thinkingFeedback: reportComment.thinkingFeedback
          ? [
              reportComment.thinkingFeedback.good,
              reportComment.thinkingFeedback.improve,
              reportComment.thinkingFeedback.tip,
            ].join(" ")
          : thinkingFeedback,
        radarScores: {
          vocabulary: vocabularyScore,
          understanding: understandingScore,
          thinking: thinkingScore,
          expression: expressionScore,
        },
        thinkingNotes,
      });
    }
  }, [
    phase,
    hasQuizData,
    onComplete,
    resultCpm,
    reportComment,
    thinkingNotes,
    thinkingScore,
    totalCorrect,
    totalObjectiveQuizzes,
    understandingScore,
    expressionScore,
    vocabularyScore,
  ]);

  /** 현재 문항 번호 (1-based). core=1, mcq=2..n, summary=n+1.. */
  const currentStepIndex =
    phase === "core" || phase === "coreFeedback"
      ? 1
      : phase === "mcq"
        ? 2 + mcqIndex
        : phase === "summary"
          ? 2 + totalMcqCount + summaryIndex
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
    const isLastMcq = mcqIndex >= (totalMcqCount || 1) - 1;
    if (isLastMcq) {
      if (hasSummary) setPhase("summary");
      else setPhase("RESULT");
    } else {
      setMcqIndex((i) => i + 1);
    }
  };

  const handleSummarySubmit = () => {
    if (summaryText.trim().length < 20) return;
    const nextAnswers = [...summaryAnswers];
    nextAnswers[summaryIndex] = summaryText.trim();
    setSummaryAnswers(nextAnswers);
    const isLastSummary = summaryIndex >= totalSummaryCount - 1;
    if (!isLastSummary) {
      // 다음 요약 문항으로 이동
      setSummaryIndex((idx) => Math.min(idx + 1, totalSummaryCount - 1));
      setSummaryText("");
      return;
    }
    // 마지막 문항이면 로딩 후 바로 통합 리포트 화면으로
    setSummaryLoading(true);
    setTimeout(() => {
      setSummaryLoading(false);
      setPhase("RESULT");
    }, 900);
  };

  const summaryCharLimit = 200;
  const todayLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

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
    const totalChars = story.content.replace(/\s+/g, "").length;
    const estimatedSeconds =
      resultCpm > 0 ? Math.round((totalChars / resultCpm) * 60) : 0;
    const speedTier = getCPMTier(resultCpm || 0);
    const readingIndexScore = Math.round(
      (vocabularyScore + understandingScore + thinkingScore + expressionScore) / 4
    );
    const readingIndexLabel =
      readingIndexScore >= 90
        ? "매우 높음"
        : readingIndexScore >= 80
          ? "높음"
          : readingIndexScore >= 70
            ? "안정적"
            : "성장 중";
    const readingIndexComment =
      readingIndexScore >= 90
        ? "읽기 지수가 매우 높아요. 글의 핵심을 빠르게 파악하고, 자신의 생각까지 또렷하게 연결하고 있어요."
        : readingIndexScore >= 80
          ? "읽기 지수가 높게 형성되고 있어요. 내용을 잘 이해하고 있으며, 근거를 조금 더 자세히 표현하면 더 탄탄해질 수 있어요."
          : readingIndexScore >= 70
            ? "읽기 지수가 안정적으로 쌓이고 있어요. 핵심 내용을 잘 따라가고 있으니, 답을 고를 때 글의 근거를 한 번 더 떠올려 보세요."
            : "읽기 지수가 차근차근 성장하고 있어요. 천천히 다시 읽으며 핵심 단서를 찾는 연습을 하면 더 좋아질 거예요.";
    return (
      <div className="w-full bg-white flex flex-col items-center py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-5xl"
        >
          <div className="pb-4">
            <div className="rounded-3xl bg-gradient-to-r from-[#FFE6D1] to-[#FFB56A] px-6 py-4 shadow-sm">
              <h1 className="text-center text-2xl font-extrabold text-[#212529]">
                학습 리포트
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold text-[#F97316]">글 제목</p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#212529]">{title}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">학습일</p>
                  <p className="mt-2 text-2xl font-extrabold text-[#212529]">{todayLabel}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">읽기 속도</p>
                  <p className="mt-2 text-2xl font-extrabold text-[#212529]">{resultCpm} 글자/분</p>
                  <p className="mt-1 text-sm font-semibold text-[#212529]">{speedTier.label}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">걸린 시간</p>
                  <p className="mt-2 text-2xl font-extrabold text-[#212529]">{formatDuration(estimatedSeconds)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">퀴즈 정답률</p>
                  <p className="mt-2 text-2xl font-extrabold text-[#212529]">
                    {totalCorrect} / {totalObjectiveQuizzes}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="rounded-3xl bg-[#FFF7D6] p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="/images/character_wink.jpg"
                    alt="또독이 윙크"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#D97706]">총평</p>
                  <p className="mt-2 whitespace-pre-line text-base leading-7 text-[#212529]">
                    {reportComment.summaryComment}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {showSummaryAnalysis && (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-2xl font-extrabold text-[#212529]">사고력 글쓰기 분석</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  내가 작성한 답안과 예시 답안을 비교해 볼까요?
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                {summaryItems.map((item, idx) => (
                  <div
                    key={`${idx}-${item.question ?? "summary"}`}
                    className="rounded-3xl bg-gray-50 p-5"
                  >
                    <p className="text-sm font-bold text-[#F97316]">{idx + 1}번 문항</p>
                    <p className="mt-2 text-xl font-bold text-[#212529]">
                      {item.question ?? `요약 문항 ${idx + 1}`}
                    </p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-sm font-semibold text-[#F97316]">나의 답안</p>
                        <p className="mt-3 min-h-24 whitespace-pre-wrap text-sm leading-7 text-[#212529]">
                          {summaryAnswers[idx]?.trim() || "작성한 답안이 아직 없어요."}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-sm font-semibold text-gray-700">예시 답안</p>
                        <p className="mt-3 min-h-24 whitespace-pre-wrap text-sm leading-7 text-[#212529]">
                          {item.modelAnswer || item.exampleAnswer || "예시 답안이 준비되지 않았어요."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {showDetailedReport && (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mx-auto w-full max-w-5xl">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#212529]">영역별 결과</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    영역별 학습 결과를 확인해 보세요.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-6 md:flex-row">
                  <div className="flex-1 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                    <div className="h-[320px] w-full sm:h-[360px] min-w-0 flex items-center justify-center">
                      <RadarChart
                        width={320}
                        height={320}
                        data={reportRadarData}
                      >
                        <PolarGrid stroke="#FDE7D7" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "#212529", fontSize: 13, fontWeight: 700 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{ fill: "#9CA3AF", fontSize: 11 }}
                        />
                        <Radar
                          name="학습 점수"
                          dataKey="value"
                          stroke="#F97316"
                          fill="#FDBA74"
                          fillOpacity={0.35}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </div>
                  </div>

                  <div className="flex-1 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF7D6]">
                        <Image
                          src="/images/character_wink.jpg"
                          alt="또독이 윙크"
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#F97316]">학습 분석</p>
                        <h4 className="mt-1 text-2xl font-extrabold text-[#212529]">결과 요약</h4>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-[#FFF7D6] p-5">
                      <p className="text-sm font-bold text-[#D97706]">
                        읽기 지수 {readingIndexScore}점 · {readingIndexLabel}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#212529]">
                        {readingIndexComment}
                      </p>
                    </div>

                    <ul className="mt-6 space-y-3">
                      <li className="flex gap-3 text-sm leading-7 text-[#212529]">
                        <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                        <span>{reportComment.speedComment}</span>
                      </li>
                      <li className="flex gap-3 text-sm leading-7 text-[#212529]">
                        <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                        <span>{reportComment.timeComment}</span>
                      </li>
                      {!showSummaryAnalysis && (
                        <li className="flex gap-3 text-sm leading-7 text-[#212529]">
                          <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                          <span>{reportComment.summaryComment}</span>
                        </li>
                      )}
                    </ul>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <p className="text-base font-bold text-[#212529]">영역별 강점 피드백</p>
                      <ul className="mt-4 space-y-3">
                        {detailedFeedbackItems.map((item) => (
                          <li key={item.label} className="flex gap-3 text-sm leading-7 text-[#212529]">
                            <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />
                            <span>
                              <span className="font-bold text-[#F97316]">{item.label}</span>
                              {` · ${item.feedback.good} ${item.feedback.improve} ${item.feedback.tip}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          </div>
          <div className="grid w-full grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => router.push(pathname)}
              className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-[#212529] transition-colors hover:bg-gray-50"
            >
              다시 하기
            </button>
            <button
              type="button"
              onClick={() => router.push("/reading")}
              className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-[#212529] transition-colors hover:bg-gray-50"
            >
              다른 글 읽기
            </button>
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="rounded-2xl bg-[#F97316] px-4 py-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              홈 화면
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const progressPercent =
    totalActivities > 0 ? (currentStepIndex / totalActivities) * 100 : 0;

  return (
    <div className="w-full bg-white flex flex-col items-center p-4 py-10 md:py-12">
      <div className="w-full max-w-[1000px]">
        {/* 진행률 표시기 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xl font-semibold text-[#212529] mb-2">
            <span>
              {currentStepIndex} / {totalActivities}
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

        {/* 공통 헤더 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm mb-6">
          <h1 className="font-extrabold text-3xl text-[#212529] mb-2">{title}</h1>
          <p className="text-gray-600 text-lg md:text-xl">
            문해 활동으로 나의 실력을 확인해요.
          </p>
        </div>

        {/* 단계별 퀴즈 카드 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
          {phase === "core" && coreQuiz && (
            <>
              <h2 className="font-bold text-2xl md:text-3xl text-[#212529] mb-2">
                1단계 | 핵심 단어 퀴즈
              </h2>
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
              <div className="flex flex-col lg:flex-row items-stretch gap-3">
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
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCoreCheck}
                    className="rounded-xl px-6 py-4 min-h-[3.5rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all flex-1 sm:flex-none"
                  >
                    확인 완료!
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
              <h2 className="font-bold text-2xl md:text-3xl text-[#212529] mb-4">
                1단계 | 핵심 단어 퀴즈
              </h2>
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
                {hasMcq ? "다음" : hasSummary ? "다음" : "제출하기"}
              </button>
            </div>
          )}

          {phase === "mcq" && currentMcq && shuffledOrder.length > 0 ? (
            <>
              <h2 className="font-bold text-2xl md:text-3xl text-[#212529] mb-2">
                2단계 | 내용 이해 퀴즈
              </h2>
              <p className="text-[#212529] font-medium text-xl mb-6">{currentMcq.q}</p>
              <ul className="space-y-3">
                {shuffledOrder.map((origIdx, displayedIdx) => (
                  <li key={origIdx}>
                    <button
                      type="button"
                      onClick={() => handleMcqSelect(displayedIdx)}
                      disabled={mcqFeedback !== null}
                      className={`w-full text-left rounded-2xl border-2 px-5 py-4 text-lg transition-all disabled:opacity-80 min-h-[4rem] ${
                        mcqFeedback === null
                          ? "border-gray-100 hover:border-[#ff5700]/40 hover:bg-[#fff5f0]"
                          : origIdx === currentMcq.ans
                            ? "border-green-500 bg-green-50 text-green-800"
                            : mcqFeedback === "wrong" && origIdx === currentMcq.ans
                              ? "border-green-500 bg-green-50 text-green-800"
                              : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-[#212529]">
                          {displayedIdx + 1}
                        </span>
                        <span>{currentMcq.options[origIdx]}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 min-h-[196px] flex flex-col">
                {mcqFeedback === null && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={handleMcqSkip}
                      className="rounded-lg px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                      모르겠어요
                    </button>
                  </div>
                )}
                {mcqFeedback === "correct" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-3 p-5 rounded-xl bg-sky-50 border border-sky-200"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-200 bg-white">
                      <Image src="/images/character.png" alt="" width={48} height={48} className="w-full h-auto object-contain" />
                    </span>
                    <p className="font-bold text-xl text-sky-900">정답이에요! 정말 잘했어요!</p>
                  </motion.div>
                )}
                {mcqFeedback === "wrong" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex flex-col gap-2 p-5 rounded-xl bg-amber-50 border border-amber-200"
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
                    className="mt-4 rounded-xl px-8 py-4 min-h-[3.25rem] font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98] transition-all text-lg"
                  >
                    {mcqIndex + 1 < (readQuizzes?.length ?? 0) ? "다음" : hasSummary ? "다음" : "제출하기"}
                  </button>
                )}
              </div>
            </>
          ) : null}

          {phase === "summary" && totalSummaryCount > 0 && (
            <>
              <h2 className="font-bold text-2xl md:text-3xl text-[#212529] mb-2">
                3단계 | 사고력 글쓰기 훈련
              </h2>
              <p className="text-[#ff5700] font-bold text-lg mb-4">나의 생각 정리하기</p>
              {summaryItems[summaryIndex]?.question && (
                <p className="text-[#212529] font-semibold text-xl mb-4">
                  {summaryItems[summaryIndex]?.question}
                </p>
              )}
              {!summaryItems[summaryIndex]?.question && (
                <p className="text-[#212529] font-medium text-lg mb-2">글을 읽고 요약해 보세요.</p>
              )}
              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                placeholder="오늘 읽은 내용을 나만의 말로 정리해 보세요."
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-[#212529] min-h-[160px] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/50 focus:border-[#ff5700] resize-y"
                maxLength={summaryCharLimit || undefined}
              />
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  글자수: <span className="font-semibold text-[#212529]">{summaryText.length}/{summaryCharLimit}</span> | 최소
                  <span className="font-semibold text-[#ff5700]"> 20자 이상</span> 입력하면 AI가 답변을 분석해 줘요.
                </p>
                <button
                  type="button"
                  onClick={handleSummarySubmit}
                  disabled={summaryText.trim().length < 20 || summaryLoading}
                  className={`rounded-xl px-8 py-3 min-h-[3rem] font-bold text-white transition-all ${
                    summaryText.trim().length < 20 || summaryLoading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#ff5700] hover:bg-[#e64d00] active:scale-[0.98]"
                  }`}
                >
                  {summaryLoading
                    ? "AI가 답변을 분석 중이에요..."
                    : summaryIndex >= totalSummaryCount - 1
                      ? "제출하기"
                      : "다음"}
                </button>
              </div>
              {summaryLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center gap-2 text-sm text-gray-600"
                >
                  <span className="inline-flex h-3 w-3 rounded-full bg-[#ff5700] animate-pulse" />
                  <span>AI가 답변을 분석 중이에요...</span>
                </motion.div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
