"use client";

interface AnalysisFeedbackProps {
  totalSentencesRead: number;
  todayAccuracy: number;
  goodItems: string[];
  improveItems: string[];
}

const ZERO_STATE_MESSAGE =
  "아직 학습 기록이 없어요. 또독 읽기를 시작해 보세요!";

export default function AnalysisFeedback({
  totalSentencesRead,
  todayAccuracy,
  goodItems,
  improveItems,
}: AnalysisFeedbackProps) {
  const hasNoData = totalSentencesRead === 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full min-w-0">
      <div className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ttodock-orange/10 text-ttodock-orange text-lg"
            aria-hidden
          >
            ✓
          </span>
          <h3 className="font-extrabold text-lg text-[#212529] truncate">
            잘하고 있어요!
          </h3>
        </div>
        {hasNoData ? (
          <p className="text-sm font-medium text-gray-500 leading-relaxed overflow-hidden text-ellipsis">
            {ZERO_STATE_MESSAGE}
          </p>
        ) : (
          <ul className="space-y-2">
            {goodItems.length > 0 ? (
              goodItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700 min-w-0">
                  <span className="text-ttodock-orange mt-0.5 shrink-0">•</span>
                  <span className="overflow-hidden text-ellipsis">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-sm font-medium text-gray-400">아직 항목이 없어요. 조금 더 학습해 보세요!</li>
            )}
          </ul>
        )}
      </div>
      <div className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-lg"
            aria-hidden
          >
            →
          </span>
          <h3 className="font-extrabold text-lg text-[#212529] truncate">
            더 노력해봐요!
          </h3>
        </div>
        {hasNoData ? (
          <p className="text-sm font-medium text-gray-500 leading-relaxed overflow-hidden text-ellipsis">
            {ZERO_STATE_MESSAGE}
          </p>
        ) : (
          <ul className="space-y-2">
            {improveItems.length > 0 ? (
              improveItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700 min-w-0">
                  <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                  <span className="overflow-hidden text-ellipsis">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-sm font-medium text-gray-400">잘하고 있어요! 꾸준히 유지해 보세요.</li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
