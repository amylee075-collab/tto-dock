"use client";

import { useState, useCallback, useMemo } from "react";
import type { QuizWordItem } from "@/lib/quiz-words-from-supabase";

const MAX_QUESTIONS_PER_DAY = 3;
const END_MESSAGE_LINE1 = "준비된 또독 단어 퀴즈가 모두 끝났습니다.";
const END_MESSAGE_LINE2 = "내일 다시 도전해 봐요!";

const ORANGE = "#F97316";

/** 주황색 빈칸 박스 (물음표, 고정폭 120px) */
function BlankBox() {
  return (
    <span
      className="inline-flex items-center justify-center align-baseline rounded-lg text-white font-bold text-lg mx-0.5 shrink-0"
      style={{ width: "120px", minWidth: "120px", backgroundColor: ORANGE, height: "1.75rem" }}
      aria-hidden
    >
      ?
    </span>
  );
}

/** 예문에서 정답 단어 자리를 주황 빈칸 박스로 치환한 React 노드. 밑줄(____) 미사용 */
function sentenceWithBlankNodes(sentence: string, word: string): React.ReactNode {
  const s = (sentence ?? "").trim();
  if (!s) return "이 단어의 의미로 올바른 것은?";
  if (!word.trim()) return s;
  const trimmed = word.trim();
  const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;
  while ((match = regex.exec(s)) !== null) {
    parts.push(s.slice(lastIndex, match.index));
    parts.push(<BlankBox key={`blank-${keyIdx++}`} />);
    lastIndex = match.index + match[0].length;
  }
  parts.push(s.slice(lastIndex));
  return parts;
}

type Props = {
  quizItems: QuizWordItem[];
  optionPool: QuizWordItem[];
  className?: string;
  variant?: "standalone" | "inline";
};

export default function TodayWordQuizCard({
  quizItems,
  optionPool,
  className = "",
  variant = "standalone",
}: Props) {
  const totalQuestions = Math.min(MAX_QUESTIONS_PER_DAY, quizItems.length);
  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const isInline = variant === "inline";
  const isLastStep = totalQuestions > 0 && step === totalQuestions - 1;
  const currentItem = quizItems[step] ?? null;

  /** 서버에서 문항별 options가 오면 그대로 사용(이미 셔플됨). 없으면 폴백으로 정렬 고정 */
  const options = useMemo(() => {
    if (!currentItem) return [];
    if (Array.isArray(currentItem.options) && currentItem.options.length >= 3) {
      return currentItem.options.slice(0, 3);
    }
    const poolWords = optionPool.map((w) => w.word);
    const otherQuizWords = quizItems
      .filter((q) => q.id !== currentItem.id)
      .map((q) => q.word);
    const others = [...new Set([...poolWords, ...otherQuizWords])]
      .filter((w) => w !== currentItem.word)
      .sort((a, b) => a.localeCompare(b, "ko"));
    const wrongs = others.slice(0, 2);
    return [...[currentItem.word, ...wrongs].sort((a, b) => a.localeCompare(b, "ko"))];
  }, [currentItem, step, optionPool, quizItems]);

  const handleSelect = useCallback(
    (word: string) => {
      if (answered !== null || !currentItem) return;
      setSelectedWord(word);
      setAnswered(word === currentItem.word);
    },
    [answered, currentItem]
  );

  const goNext = useCallback(() => {
    setAnswered(null);
    setSelectedWord(null);
    setStep((s) => Math.min(s + 1, totalQuestions - 1));
  }, [totalQuestions]);

  const showEndMessage = isLastStep && answered !== null;
  const showNextButton = answered !== null && !isLastStep;

  if (quizItems.length === 0) {
    return (
      <section
        className={`${
          isInline
            ? "h-full min-h-[220px] flex flex-col"
            : "rounded-2xl border border-gray-200 bg-white p-6 sm:p-6 flex flex-col h-full min-h-[320px]"
        } ${className}`}
        aria-label="단어 퀴즈"
      >
        <h2 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-4">
          또독 단어 퀴즈
        </h2>
        <div className="flex-1 flex items-center justify-center rounded-xl bg-white p-0">
          <p className="text-sm text-gray-500 text-center">
            준비된 퀴즈가 없어요. 관리자가 단어를 등록하면 여기서 풀 수 있어요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${
        isInline
          ? "h-full min-h-[220px] flex flex-col min-h-0"
          : "rounded-2xl border border-gray-200 bg-white p-6 sm:p-6 flex flex-col h-full min-h-[320px]"
      } ${className}`}
      aria-label="단어 퀴즈"
    >
      <h2 className="font-extrabold text-xl sm:text-2xl text-[#212529] mb-4 shrink-0">
        또독 단어 퀴즈
      </h2>

      <div className="flex-1 flex flex-col justify-start gap-4 min-h-0 rounded-xl bg-white p-0 min-w-0">
        {currentItem && (
          <>
            <div className="min-h-[72px] shrink-0">
              <p
                className="text-sm font-medium mb-2 leading-relaxed"
                style={{ color: ORANGE }}
              >
                빈칸에 들어갈 단어를 고르세요 | {step + 1}/{totalQuestions}
              </p>
              <p className="text-base sm:text-lg text-[#212529] font-medium leading-relaxed">
                {sentenceWithBlankNodes(currentItem.example, currentItem.word)}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:gap-4 flex-wrap shrink-0">
              {options.map((word) => {
                const isSelected = selectedWord === word;
                const correct = word === currentItem.word;
                const showResult = answered !== null;
                const isCorrectChoice = showResult && isSelected && correct;
                const isWrongChoice = showResult && isSelected && !correct;
                const isUnselectedCorrect = showResult && correct && !isSelected;

                return (
                  <button
                    key={word}
                    type="button"
                    disabled={answered !== null}
                    onClick={() => handleSelect(word)}
                    className={`flex-1 min-w-0 rounded-xl px-4 py-3.5 text-left font-semibold transition-colors disabled:pointer-events-none flex items-center gap-3 min-h-[52px] border-2
                      ${!showResult
                        ? "bg-gray-50 border-gray-200 text-[#212529] hover:border-[#ff5700]/30 hover:bg-[#fffaf8]"
                        : ""}
                      ${isCorrectChoice
                        ? "bg-[#374151] border-[#374151] text-white"
                        : ""}
                      ${isWrongChoice
                        ? "bg-red-50 border-red-300 text-red-800"
                        : ""}
                      ${isUnselectedCorrect
                        ? "bg-gray-50 border-gray-200 text-gray-600"
                        : ""}
                      ${showResult && !correct && !isSelected
                        ? "bg-gray-50 border-gray-200 text-gray-600"
                        : ""}
                    `}
                  >
                    <span
                      className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold
                        ${!showResult ? "bg-gray-200 text-gray-500" : ""}
                        ${isCorrectChoice ? "bg-white/30 text-white" : ""}
                        ${isWrongChoice ? "bg-red-200 text-red-700" : ""}
                        ${(isUnselectedCorrect || (showResult && !correct && !isSelected)) ? "bg-gray-200 text-gray-500" : ""}
                      `}
                      aria-hidden
                    >
                      {showResult && isSelected ? (correct ? "✓" : "✗") : "?"}
                    </span>
                    <span>{word}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="h-[72px] flex flex-col items-center justify-center shrink-0 py-0 px-0">
          {showNextButton && (
            <button
              type="button"
              onClick={goNext}
              className="shrink-0 rounded-full bg-gray-200 text-[#212529] px-4 py-2 text-sm font-medium hover:bg-gray-300 transition-colors min-w-[100px] max-w-[140px]"
            >
              다음 퀴즈
            </button>
          )}
          {showEndMessage && (
            <p className="text-sm text-gray-600 text-center max-w-[280px] leading-[1.7]">
              {END_MESSAGE_LINE1}
              <br />
              {END_MESSAGE_LINE2}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
