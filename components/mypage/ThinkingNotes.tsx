"use client";

import type { ThinkingNoteItem } from "@/lib/study-log-types";

interface ThinkingNotesProps {
  notes: ThinkingNoteItem[];
}

export default function ThinkingNotes({ notes }: ThinkingNotesProps) {
  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm overflow-hidden">
      <div className="mb-4">
        <h3 className="font-extrabold text-lg text-[#212529]">사고력 노트</h3>
        <p className="mt-2 text-sm text-gray-500">
          내가 작성한 답안과 예시 답안을 다시 살펴보며 생각의 흐름을 정리해 보세요.
        </p>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm font-medium text-gray-400">아직 사고력 노트가 없어요.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <article key={`${note.kstDate ?? "note"}-${index}`} className="rounded-2xl bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {note.title && (
                  <span className="text-sm font-bold text-[#212529]">{note.title}</span>
                )}
                {note.kstDate && (
                  <span className="text-xs font-medium text-gray-500">{note.kstDate}</span>
                )}
              </div>
              <p className="text-sm font-semibold text-[#F97316] mb-2">{note.question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-semibold text-[#F97316] mb-2">나의 답안</p>
                  <p className="text-sm leading-6 text-[#212529] whitespace-pre-wrap">
                    {note.userAnswer || "작성한 답안이 없어요."}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">예시 답안</p>
                  <p className="text-sm leading-6 text-[#212529] whitespace-pre-wrap">
                    {note.modelAnswer || "예시 답안이 없어요."}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
