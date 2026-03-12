"use client";

import Image from "next/image";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { StudyLogRecord } from "@/lib/study-log-types";

interface StudyLogReportModalProps {
  log: StudyLogRecord<"reading_session"> | null;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  short: "짧은 글",
  long: "긴 글",
  category: "문해 학습",
  digital: "디지털 문해",
};

export default function StudyLogReportModal({
  log,
  onClose,
}: StudyLogReportModalProps) {
  if (!log) return null;

  const title = log.payload.title || "학습 리포트";
  const typeLabel = TYPE_LABEL[log.contentType ?? ""] ?? "문해 학습";
  const radarScores = log.payload.radarScores;
  const radarData = radarScores
    ? [
        { subject: "어휘력", value: radarScores.vocabulary, fullMark: 100 },
        { subject: "이해력", value: radarScores.understanding, fullMark: 100 },
        { subject: "사고력", value: radarScores.thinking, fullMark: 100 },
        { subject: "표현력", value: radarScores.expression, fullMark: 100 },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFF1E8] px-3 py-1 text-xs font-bold text-[#F97316]">
                {typeLabel}
              </span>
              <span className="text-xs font-medium text-gray-500">{log.kstDate}</span>
            </div>
            <h3 className="mt-3 text-2xl font-extrabold text-[#212529]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="리포트 닫기"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">퀴즈 결과</p>
            <p className="mt-2 text-2xl font-extrabold text-[#212529]">
              {log.payload.quizCorrect} / {log.payload.quizTotal}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">읽기 속도</p>
            <p className="mt-2 text-2xl font-extrabold text-[#212529]">
              {log.payload.cpm} 글자/분
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">기록일</p>
            <p className="mt-2 text-2xl font-extrabold text-[#212529]">{log.kstDate}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#FFF7D6]">
                <Image
                  src="/images/character_wink.jpg"
                  alt="또독이"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#F97316]">결과 요약</p>
                <p className="text-lg font-extrabold text-[#212529]">이번 학습 리포트</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-[#FFF7D6] p-4">
                <p className="text-sm leading-7 text-[#212529]">
                  {log.payload.summaryFeedback || "이번 학습을 끝까지 마친 점이 좋아요."}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm leading-7 text-[#212529]">
                  {log.payload.thinkingFeedback ||
                    "다음 학습에서는 핵심 내용을 떠올리며 자신의 생각을 조금 더 또렷하게 적어 보세요."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-5">
            <p className="text-sm font-semibold text-[#F97316]">영역별 결과</p>
            {radarData.length > 0 ? (
              <div className="mt-4 h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#FDE7D7" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#212529", fontSize: 12, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="#F97316"
                      fill="#FDBA74"
                      fillOpacity={0.35}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                아직 영역별 분석 데이터가 없어요.
              </div>
            )}
          </div>
        </div>

        {log.payload.thinkingNotes && log.payload.thinkingNotes.length > 0 && (
          <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-5">
            <p className="text-lg font-extrabold text-[#212529]">사고력 노트</p>
            <div className="mt-4 space-y-3">
              {log.payload.thinkingNotes.slice(0, 3).map((note, index) => (
                <div key={`${log.id}-${index}`} className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-bold text-[#F97316]">{note.question}</p>
                  <p className="mt-2 text-sm leading-6 text-[#212529] whitespace-pre-wrap">
                    {note.userAnswer || "작성한 답안이 없어요."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
