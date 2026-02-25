"use client";

import { useState } from "react";
import type { Quiz } from "@/lib/data";

interface QuizSectionProps {
  quizzes: Quiz[];
  onComplete: (correctCount: number, total: number) => void;
}

export default function QuizSection({ quizzes, onComplete }: QuizSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const quiz = quizzes[currentIndex];
  const isLast = currentIndex === quizzes.length - 1;

  const handleSubmit = () => {
    if (!selectedAnswer || !quiz) return;
    const correct = selectedAnswer === quiz.answer;
    if (correct) setCorrectCount((c) => c + 1);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLast) {
      const finalCorrect =
        correctCount + (selectedAnswer === quiz.answer ? 1 : 0);
      onComplete(finalCorrect, quizzes.length);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  if (!quiz) return null;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-10">
      <h2 className="font-extrabold text-xl text-[#212529] mb-2">퀴즈</h2>
      <p className="text-sm text-gray-500 mb-6">
        {currentIndex + 1} / {quizzes.length}
      </p>
      <p className="font-bold text-lg text-[#212529] mb-4">{quiz.question}</p>
      <ul className="space-y-2 mb-6">
        {quiz.options.map((opt) => (
          <li key={opt}>
            <button
              type="button"
              disabled={showExplanation}
              onClick={() => !showExplanation && setSelectedAnswer(opt)}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 font-medium transition-colors ${
                selectedAnswer === opt
                  ? opt === quiz.answer
                    ? "border-green-500 bg-green-50 text-green-800"
                    : "border-ttodock-orange bg-soft-orange"
                  : "border-gray-100 hover:border-gray-200"
              } ${showExplanation && opt === quiz.answer ? "border-green-500 bg-green-50" : ""}`}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
      {!showExplanation ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="rounded-xl bg-ttodock-orange px-6 py-3 font-bold text-white shadow-sm disabled:opacity-50"
        >
          확인
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
            <span className="font-bold text-ttodock-orange">해설:</span>{" "}
            {quiz.explanation}
          </p>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl bg-ttodock-orange px-6 py-3 font-bold text-white shadow-sm"
          >
            {isLast ? "결과 보기" : "다음 문제"}
          </button>
        </div>
      )}
    </section>
  );
}
