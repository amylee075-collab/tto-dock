"use client";

interface AnalysisFeedbackProps {
  goodItems: string[];
  improveItems: string[];
}

export default function AnalysisFeedback({
  goodItems,
  improveItems,
}: AnalysisFeedbackProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ttodock-orange/10 text-ttodock-orange text-lg"
            aria-hidden
          >
            ✓
          </span>
          <h3 className="font-extrabold text-lg text-[#212529]">
            잘하고 있어요!
          </h3>
        </div>
        <ul className="space-y-2">
          {goodItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700">
              <span className="text-ttodock-orange mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-lg"
            aria-hidden
          >
            →
          </span>
          <h3 className="font-extrabold text-lg text-[#212529]">
            더 노력해봐요!
          </h3>
        </div>
        <ul className="space-y-2">
          {improveItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700">
              <span className="text-amber-500 mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
