"use client";

import { useState } from "react";
import type { ShortStory } from "@/lib/data";
import type { ContentTypeSupabase } from "@/lib/content-from-supabase";

type TabId = "core" | "read" | "summary";

interface ContentEditFormProps {
  initialStory: ShortStory;
  contentType: ContentTypeSupabase;
}

export default function ContentEditForm({
  initialStory,
  contentType,
}: ContentEditFormProps) {
  const [id] = useState(initialStory.id);
  const [type] = useState(contentType);
  const [title, setTitle] = useState(initialStory.title);
  const [content, setContent] = useState(initialStory.content ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialStory.thumbnail ?? "");
  const [section, setSection] = useState(initialStory.section ?? "");
  const [badges, setBadges] = useState((initialStory.badges ?? []).join(", "));
  const [difficulty, setDifficulty] = useState<number | "">(
    initialStory.difficulty ?? ""
  );

  const [activeTab, setActiveTab] = useState<TabId>("core");

  const core = initialStory.coreQuiz;
  const [sentence, setSentence] = useState(core?.sentence ?? "");
  const [coreAnswer, setCoreAnswer] = useState(core?.answer ?? "");
  const [similarAnswersStr, setSimilarAnswersStr] = useState(
    (core?.similarAnswers ?? []).join("\n")
  );
  const [questionFallback, setQuestionFallback] = useState(core?.question ?? "");

  const [readQuizzes, setReadQuizzes] = useState<
    { q: string; options: string[]; ans: number }[]
  >(
    (initialStory.readQuizzes ?? []).map((r) => ({
      q: r.q,
      options: [...r.options],
      ans: r.ans,
    }))
  );

  const summaryArray =
    Array.isArray(initialStory.summaryQuiz)
      ? initialStory.summaryQuiz
      : initialStory.summaryQuiz
        ? [initialStory.summaryQuiz]
        : [];
  const [summaryItems, setSummaryItems] = useState<
    { question: string; modelAnswer: string }[]
  >(
    summaryArray.length > 0
      ? summaryArray.map((s) => ({
          question: s.question ?? "",
          modelAnswer: s.modelAnswer ?? s.exampleAnswer ?? "",
        }))
      : [{ question: "", modelAnswer: "" }]
  );
  const summaryBase = summaryArray[0];
  const [requiredKeywordsStr, setRequiredKeywordsStr] = useState(
    (summaryBase?.requiredKeywords ?? []).join(", ")
  );
  const [exampleAnswer, setExampleAnswer] = useState(
    summaryBase?.exampleAnswer ?? ""
  );
  const [charLimit3, setCharLimit3] = useState(
    summaryBase?.charLimitByGrade?.["3"] ?? ""
  );
  const [charLimit4, setCharLimit4] = useState(
    summaryBase?.charLimitByGrade?.["4"] ?? ""
  );
  const [charLimit5, setCharLimit5] = useState(
    summaryBase?.charLimitByGrade?.["5"] ?? ""
  );
  const [charLimit6, setCharLimit6] = useState(
    summaryBase?.charLimitByGrade?.["6"] ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const addReadQuiz = () => {
    if (readQuizzes.length >= 5) return;
    setReadQuizzes((prev) => [...prev, { q: "", options: ["", ""], ans: 0 }]);
  };

  const setReadQuizQ = (index: number, q: string) => {
    setReadQuizzes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], q };
      return next;
    });
  };

  const setReadQuizOptionsCount = (index: number, count: number) => {
    const n = Math.min(4, Math.max(2, count));
    setReadQuizzes((prev) => {
      const next = [...prev];
      const opts = next[index].options;
      const newOpts =
        opts.length < n
          ? [...opts, ...Array(n - opts.length).fill("")]
          : opts.slice(0, n);
      next[index] = {
        ...next[index],
        options: newOpts,
        ans: Math.min(next[index].ans, newOpts.length - 1),
      };
      return next;
    });
  };

  const setReadQuizOption = (quizIndex: number, optIndex: number, value: string) => {
    setReadQuizzes((prev) => {
      const next = [...prev];
      const opts = [...next[quizIndex].options];
      opts[optIndex] = value;
      next[quizIndex] = { ...next[quizIndex], options: opts };
      return next;
    });
  };

  const setReadQuizAns = (index: number, ans: number) => {
    setReadQuizzes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ans };
      return next;
    });
  };

  const removeReadQuiz = (index: number) => {
    setReadQuizzes((prev) => prev.filter((_, i) => i !== index));
  };

  const addSummaryItem = () => {
    setSummaryItems((prev) =>
      prev.length >= 5 ? prev : [...prev, { question: "", modelAnswer: "" }]
    );
  };

  const updateSummaryItem = (
    index: number,
    field: "question" | "modelAnswer",
    value: string
  ) => {
    setSummaryItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      next[index] = item;
      return next;
    });
  };

  const removeSummaryItem = (index: number) => {
    setSummaryItems((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const core_quiz = {
        question: questionFallback || sentence,
        answer: coreAnswer,
        ...(sentence && { sentence }),
        ...(similarAnswersStr.trim() && {
          similarAnswers: similarAnswersStr
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      };

      const read_quizzes = readQuizzes
        .filter((r) => r.q.trim() && r.options.some((o) => o.trim()))
        .map((r) => ({
          q: r.q.trim(),
          options: r.options.map((o) => o.trim()).filter(Boolean),
          ans: Math.min(r.ans, r.options.length - 1),
        }))
        .filter((r) => r.options.length >= 2);

      const charLimitByGrade: Record<string, number> = {};
      if (charLimit3 !== "") charLimitByGrade["3"] = Number(charLimit3) || 0;
      if (charLimit4 !== "") charLimitByGrade["4"] = Number(charLimit4) || 0;
      if (charLimit5 !== "") charLimitByGrade["5"] = Number(charLimit5) || 0;
      if (charLimit6 !== "") charLimitByGrade["6"] = Number(charLimit6) || 0;

      const baseMetaExists =
        requiredKeywordsStr.trim() ||
        exampleAnswer.trim() ||
        Object.keys(charLimitByGrade).length > 0;

      const cleanedSummaryItems = summaryItems
        .map((item) => ({
          question: item.question.trim(),
          modelAnswer: item.modelAnswer.trim(),
        }))
        .filter((item) => item.question || item.modelAnswer);

      const summary_quiz =
        cleanedSummaryItems.length > 0 || baseMetaExists
          ? (cleanedSummaryItems.length > 0 ? cleanedSummaryItems : [{}]).map(
              (item, idx) => ({
                ...(item.question && { question: item.question }),
                ...(item.modelAnswer && { model_answer: item.modelAnswer }),
                ...(baseMetaExists && idx === 0 && {
                  ...(requiredKeywordsStr.trim() && {
                    requiredKeywords: requiredKeywordsStr
                      .split(/[\n,]+/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }),
                  ...(exampleAnswer.trim() && {
                    exampleAnswer: exampleAnswer.trim(),
                  }),
                  ...(Object.keys(charLimitByGrade).length > 0 && {
                    charLimitByGrade,
                  }),
                }),
              })
            )
          : undefined;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const revalidateSecret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET;
      if (revalidateSecret) {
        headers["Authorization"] = `Bearer ${revalidateSecret}`;
      }

      const res = await fetch("/api/contents", {
        method: "POST",
        headers,
        body: JSON.stringify({
          id,
          type,
          title: title.trim(),
          content: content || null,
          thumbnail_url: thumbnailUrl || null,
          section: section.trim() || null,
          badges: badges
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean),
          difficulty:
            difficulty === "" ? null : Math.min(3, Math.max(1, Number(difficulty))),
          core_quiz,
          read_quizzes,
          summary_quiz,
        }),
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data?.error ?? "저장에 실패했습니다." });
        return;
      }
      setMessage({ type: "ok", text: "저장되었습니다." });
    } catch (e) {
      setMessage({
        type: "err",
        text: e instanceof Error ? e.message : "저장 중 오류가 났습니다.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529] min-h-[120px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">썸네일 URL</label>
          <input
            type="text"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">분야 (section)</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="과학 | 역사 | 사회"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">난이도 (1~3)</label>
            <input
              type="number"
              min={1}
              max={3}
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">칩 (badges, 쉼표 구분)</label>
          <input
            type="text"
            value={badges}
            onChange={(e) => setBadges(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
          />
        </div>
      </div>

      {/* 3단계 퀴즈 탭 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(
            [
              { id: "core" as TabId, label: "핵심 단어" },
              { id: "read" as TabId, label: "독해 퀴즈" },
              { id: "summary" as TabId, label: "요약하기" },
            ] as const
          ).map(({ id: tabId, label }) => (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tabId
                  ? "bg-[#F97316] text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "core" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                문제 문장에서 물음표로 바꿀 단어를 정답으로 넣고, 문장에는 해당 단어 대신 ? 를 넣어 주세요.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">문제 문장 (정답 자리는 ? 로)</label>
                <input
                  type="text"
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  placeholder="오늘 날씨가 ? 좋다"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">정답 단어</label>
                <input
                  type="text"
                  value={coreAnswer}
                  onChange={(e) => setCoreAnswer(e.target.value)}
                  placeholder="맑아서"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">유사 정답 (줄마다 하나, 띄어쓰기 무시 매칭)</label>
                <textarea
                  value={similarAnswersStr}
                  onChange={(e) => setSimilarAnswersStr(e.target.value)}
                  placeholder="맑아서&#10;맑아&#10;..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529] min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">질문 문장 (문장 없을 때 대체)</label>
                <input
                  type="text"
                  value={questionFallback}
                  onChange={(e) => setQuestionFallback(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
                />
              </div>
            </div>
          )}

          {activeTab === "read" && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">최대 5세트. 보기 2~4개, 정답 인덱스 0부터.</p>
              {readQuizzes.map((r, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4 space-y-3 bg-gray-50/50"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#212529]">문제 {index + 1}</span>
                    {readQuizzes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReadQuiz(index)}
                        className="text-red-600 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">지문</label>
                    <input
                      type="text"
                      value={r.q}
                      onChange={(e) => setReadQuizQ(index, e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">보기 개수 (2~4)</label>
                    <select
                      value={r.options.length}
                      onChange={(e) =>
                        setReadQuizOptionsCount(index, Number(e.target.value))
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    >
                      {[2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}개
                        </option>
                      ))}
                    </select>
                  </div>
                  {r.options.map((opt, oi) => (
                    <div key={oi}>
                      <label className="block text-sm text-gray-600 mb-1">보기 {oi + 1}</label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          setReadQuizOption(index, oi, e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">정답 (보기 번호 1~{r.options.length})</label>
                    <select
                      value={r.ans}
                      onChange={(e) => setReadQuizAns(index, Number(e.target.value))}
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    >
                      {r.options.map((_, oi) => (
                        <option key={oi} value={oi}>
                          {oi + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {readQuizzes.length < 5 && (
                <button
                  type="button"
                  onClick={addReadQuiz}
                  className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-gray-600 hover:border-[#F97316] hover:text-[#F97316]"
                >
                  문제 추가
                </button>
              )}
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                최대 5문항까지 요약/생각 질문을 등록할 수 있어요. 각 문항에는 질문과 모델 예시 답안을 입력해 주세요.
              </p>
              <div className="space-y-4">
                {summaryItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#212529]">
                        요약 문항 {index + 1}
                      </span>
                      {summaryItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSummaryItem(index)}
                          className="text-xs text-red-600"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        질문
                      </label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) =>
                          updateSummaryItem(index, "question", e.target.value)
                        }
                        placeholder="예: 오늘 읽은 이야기에서 가장 기억에 남는 장면은 무엇인가요?"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        모델 예시 답안
                      </label>
                      <textarea
                        value={item.modelAnswer}
                        onChange={(e) =>
                          updateSummaryItem(index, "modelAnswer", e.target.value)
                        }
                        placeholder="예시 답안을 입력하면 아이의 답변과 나란히 비교해 볼 수 있어요."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529] min-h-[60px]"
                      />
                    </div>
                  </div>
                ))}
                {summaryItems.length < 5 && (
                  <button
                    type="button"
                    onClick={addSummaryItem}
                    className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-gray-600 hover:border-[#F97316] hover:text-[#F97316]"
                  >
                    문항 추가
                  </button>
                )}
              </div>
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI 피드백용 필수 키워드 (쉼표 또는 줄바꿈)
                  </label>
                  <textarea
                    value={requiredKeywordsStr}
                    onChange={(e) => setRequiredKeywordsStr(e.target.value)}
                    placeholder="키워드1, 키워드2"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529] min-h-[60px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    공통 예시 답안
                  </label>
                  <textarea
                    value={exampleAnswer}
                    onChange={(e) => setExampleAnswer(e.target.value)}
                    placeholder="요약 예시 (첫 번째 문항 메타데이터로 저장됩니다)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#212529] min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학년별 글자 수 제한 (선택)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { grade: "3", value: charLimit3, set: setCharLimit3 },
                      { grade: "4", value: charLimit4, set: setCharLimit4 },
                      { grade: "5", value: charLimit5, set: setCharLimit5 },
                      { grade: "6", value: charLimit6, set: setCharLimit6 },
                    ].map(({ grade, value, set }) => (
                      <div key={grade}>
                        <span className="text-sm text-gray-600">{grade}학년</span>
                        <input
                          type="number"
                          min={0}
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1 text-[#212529]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {message && (
        <p
          className={
            message.type === "ok"
              ? "text-green-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl px-6 py-3 font-bold text-white bg-[#ff5700] hover:bg-[#e64d00] disabled:opacity-60"
      >
        {saving ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}
