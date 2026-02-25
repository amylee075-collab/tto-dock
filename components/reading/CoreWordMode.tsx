"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ReadingContent } from "@/lib/data";

export type Segment =
  | { type: "text"; text: string }
  | { type: "word"; text: string; displayLabel: string; wordKey: string };

/**
 * 문장을 selectableWords 기준으로 분할. 긴 단어를 먼저 매칭해 '공동체 의식'이 한 덩어리로 묶이도록 함.
 * 렌더 시 [단어]+바로 다음 텍스트(조사 포함)를 한 span 안에 두어, 한글 띄어쓰기 규칙을 지키고 조사가 단어에 붙어 보이도록 함.
 */
export function buildSegments(
  sentence: string,
  selectableWords: string[]
): Segment[] {
  if (selectableWords.length === 0) {
    return [{ type: "text", text: sentence }];
  }
  const sorted = [...selectableWords].sort((a, b) => b.length - a.length);
  const segments: Segment[] = [];
  let pos = 0;

  while (pos < sentence.length) {
    let matched = false;
    for (const word of sorted) {
      const end = pos + word.length;
      if (sentence.slice(pos, end) === word) {
        segments.push({
          type: "word",
          text: word,
          displayLabel: word,
          wordKey: word,
        });
        pos = end;
        matched = true;
        break;
      }
    }
    if (!matched) {
      let end = pos + 1;
      while (end <= sentence.length) {
        const found = sorted.some(
          (w) => sentence.slice(end, end + w.length) === w
        );
        if (found) break;
        end++;
      }
      segments.push({ type: "text", text: sentence.slice(pos, end) });
      pos = end;
    }
  }
  return segments;
}

export default function CoreWordMode({ content }: { content: ReadingContent }) {
  const { title, sentences, coreWord, selectableWords } = content;
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const sentence = sentences[0] ?? "";
  const words = selectableWords ?? [];
  const segments = buildSegments(sentence, words);

  const handleWordClick = (wordKey: string) => {
    if (!coreWord) return;
    setFeedback(null);
    if (wordKey === coreWord) {
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
  };

  if (!coreWord) {
    return (
      <div className="py-6">
        <p className="text-gray-500">이 콘텐츠에는 핵심 단어가 없습니다.</p>
      </div>
    );
  }

  return (
    <article className="flex-1 min-w-0 space-y-8">
      <header className="text-center space-y-4">
        <h1 className="font-extrabold text-2xl sm:text-3xl text-[#212529] tracking-tight">
          {title}
        </h1>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <p className="text-center text-xl sm:text-2xl font-bold text-[#ff5700] leading-snug">
          문단의 핵심이 되는 단어를 클릭해 선택하세요.
        </p>
        <p className="text-center text-base sm:text-lg text-gray-600">
          이 문장에서 가장 중요한 단어를 클릭하세요.
        </p>
        <div className="border-b border-gray-200 pb-8 pt-2">
          <p className="text-2xl sm:text-3xl leading-relaxed tracking-wide text-[#212529]">
            {segments.map((seg, i) => {
              if (seg.type === "text") {
                if (segments[i - 1]?.type === "word") return null;
                return <span key={i}>{seg.text}</span>;
              }
              const nextText = segments[i + 1]?.type === "text" ? segments[i + 1].text : "";
              const isHighlight = feedback === "correct" && seg.wordKey === coreWord;
              return (
                <span key={i} className="inline" style={{ whiteSpace: "normal" }}>
                  <button
                    type="button"
                    onClick={() => handleWordClick(seg.wordKey)}
                    className={`m-0 inline border-0 p-0 align-baseline text-inherit leading-inherit rounded-sm transition-colors hover:bg-[#fff5f0] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/50 focus:ring-offset-1 ${
                      isHighlight ? "bg-[#ff5700]/20 text-[#ff5700] font-semibold" : ""
                    }`}
                    style={{ margin: 0, padding: 0 }}
                  >
                    {seg.displayLabel}
                  </button>{nextText}
                </span>
              );
            })}
          </p>
        </div>
        {feedback === "wrong" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 font-medium"
          >
            아직 정답이 아니에요. 문단의 핵심이 되는 단어를 다시 골라 보세요.
          </motion.p>
        )}
        {feedback === "correct" && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[#ff5700] font-bold text-lg"
          >
            정답이에요!
          </motion.p>
        )}
      </motion.div>
    </article>
  );
}
