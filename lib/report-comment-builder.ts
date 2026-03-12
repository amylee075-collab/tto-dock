import type {
  AreaFeedback,
  LearningReportComment,
  ReportCommentBuilderInput,
} from "@/lib/report-comment-types";

const ALGORITHM_VERSION = "2.0.0" as const;

const DEFAULT_SUMMARY =
  "끝까지 읽기를 마친 점이 참 좋아요. 다음에도 중요한 내용을 떠올리며 차근차근 읽어 보세요.";
const DEFAULT_SPEED =
  "읽는 속도는 이해와 함께 자라요. 내 속도에 맞게 읽으며 내용을 살펴보는 힘을 키워 보세요.";
const DEFAULT_TIME = "집중해서 읽기를 이어 간 점이 좋아요.";

const DEFAULT_AREA_FEEDBACK: AreaFeedback = {
  good: "학습을 끝까지 이어 간 점이 참 좋아요.",
  improve: "다음에는 핵심 내용을 조금 더 또렷하게 살펴보면 더 좋아질 수 있어요.",
  tip: "중요한 낱말과 문장을 먼저 떠올리며 읽어 보세요.",
};

type SpeedBand = "slow" | "stable" | "fast" | "very_fast";
type AccuracyBand = "high" | "medium" | "low";
type TimeBand = "short" | "normal" | "long";

function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function toSafeNumber(value: number | null | undefined, fallback = 0): number {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function toSafePercent(value: number | null | undefined, fallback = 0): number {
  const safe = toSafeNumber(value, fallback);
  return Math.min(100, Math.max(0, Math.round(safe)));
}

function buildAccuracy(quizCorrect?: number | null, quizTotal?: number | null): number {
  const correct = Math.max(0, toSafeNumber(quizCorrect, 0));
  const total = Math.max(0, toSafeNumber(quizTotal, 0));
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

function getSpeedBand(readingCpm: number): SpeedBand {
  if (readingCpm <= 300) return "slow";
  if (readingCpm <= 500) return "stable";
  if (readingCpm <= 700) return "fast";
  return "very_fast";
}

function getAccuracyBand(quizAccuracy: number): AccuracyBand {
  if (quizAccuracy >= 80) return "high";
  if (quizAccuracy >= 60) return "medium";
  return "low";
}

function getTimeBand(
  readingDurationSec: number,
  readingCpm: number,
  passageChars?: number | null
): TimeBand {
  if (readingDurationSec <= 0) return "normal";

  if (passageChars && passageChars > 0 && readingCpm > 0) {
    const expectedSec = (passageChars / readingCpm) * 60;
    if (readingDurationSec < Math.max(45, expectedSec * 0.75)) return "short";
    if (readingDurationSec > Math.max(150, expectedSec * 1.5)) return "long";
    return "normal";
  }

  if (readingDurationSec <= 60) return "short";
  if (readingDurationSec >= 180) return "long";
  return "normal";
}

function buildSpeedComment(speedBand: SpeedBand): string {
  const map: Record<SpeedBand, string[]> = {
    slow: [
      "천천히 꼼꼼하게 읽는 힘이 좋아요.",
      "자신의 속도에 맞춰 차분하게 읽어 나간 점이 좋아요.",
    ],
    stable: [
      "읽기 속도와 이해의 균형이 안정적으로 잡혀 있어요.",
      "안정적인 속도로 내용을 따라가는 힘이 좋아요.",
    ],
    fast: [
      "빠른 흐름 속에서도 내용을 붙잡으려는 힘이 보여요.",
      "리듬감 있게 읽으며 내용을 따라가는 모습이 좋아요.",
    ],
    very_fast: [
      "집중해서 빠르게 읽어 나가는 힘이 돋보여요.",
      "읽기의 흐름을 빠르게 이어 가는 집중력이 좋아요.",
    ],
  };
  return randomPick(map[speedBand]);
}

function buildTimeComment(timeBand: TimeBand, accuracyBand: AccuracyBand): string {
  const baseMap: Record<TimeBand, string[]> = {
    short: ["짧은 시간 안에 읽기를 마쳤어요."],
    normal: ["집중해서 끝까지 잘 읽었어요."],
    long: ["시간을 들여 끝까지 읽은 점이 좋아요."],
  };
  const base = randomPick(baseMap[timeBand]);
  if (timeBand === "short" && accuracyBand === "low") {
    return `${base} 조금 서둘러 읽었을 수 있어요.`;
  }
  return base;
}

function buildSummaryMessage(
  accuracyBand: AccuracyBand,
  speedBand: SpeedBand
): string {
  const map: Record<AccuracyBand, Partial<Record<SpeedBand, string[]>>> = {
    high: {
      stable: [
        "내용을 잘 이해하면서 안정적으로 읽었어요. 읽기 속도와 이해의 균형이 좋아요.",
      ],
      fast: [
        "내용을 잘 이해하면서 안정적으로 읽었어요. 읽기 속도와 이해의 균형이 좋아요.",
      ],
      slow: [
        "천천히 읽었지만 내용을 정확하게 이해했어요. 꼼꼼하게 읽는 힘이 돋보였어요.",
      ],
      very_fast: [
        "빠르게 읽으면서도 내용을 잘 이해했어요. 집중력이 아주 좋았어요.",
      ],
    },
    medium: {
      fast: [
        "읽는 속도는 좋았지만 중요한 내용을 조금 놓쳤을 수 있어요. 핵심 문장을 조금 더 의식하며 읽어 보세요.",
      ],
      stable: [
        "전체적인 내용은 잘 따라왔어요. 핵심 내용을 조금 더 또렷하게 잡아보면 좋아요.",
      ],
      slow: [
        "차분하게 읽으려는 모습이 좋았어요. 중요한 정보를 조금 더 정리해 보면 좋아요.",
      ],
      very_fast: [
        "읽는 흐름은 좋았어요. 핵심 내용을 조금 더 또렷하게 붙잡아 보면 더 좋아질 수 있어요.",
      ],
    },
    low: {
      fast: [
        "조금 빨리 읽어서 중요한 내용을 놓쳤을 수 있어요. 다음에는 핵심 문장을 생각하며 읽어 보세요.",
      ],
      stable: [
        "끝까지 읽었지만 내용 이해는 조금 더 연습이 필요해요. 중심 내용을 다시 정리해 보면 도움이 될 거예요.",
      ],
      slow: [
        "천천히 읽으려 노력했어요. 문단마다 어떤 내용인지 정리하며 읽어 보세요.",
      ],
      very_fast: [
        "읽는 흐름이 빨랐어요. 다음에는 핵심 문장을 떠올리며 읽으면 내용을 더 잘 붙잡을 수 있어요.",
      ],
    },
  };

  const exact = map[accuracyBand][speedBand];
  if (exact?.length) return randomPick(exact);
  return DEFAULT_SUMMARY;
}

function buildVocabularyFeedback(input: ReportCommentBuilderInput): AreaFeedback {
  const coreWordCorrect = Boolean(input.coreWordCorrect);
  const vocabContextAccuracy = toSafePercent(input.vocabContextAccuracy, 0);
  const synonymRecognition = Boolean(input.synonymRecognition);

  if (!coreWordCorrect) {
    return {
      good: randomPick([
        "단어 활동에 끝까지 집중하며 글의 중요한 낱말을 살펴보았어요.",
        "핵심 낱말을 찾으려는 시도가 아주 좋아요.",
      ]),
      improve: randomPick([
        "글에서 가장 중요한 단어를 찾는 연습을 더 해보면 어휘력이 더 탄탄해질 수 있어요.",
      ]),
      tip: "모르는 단어가 나오면 앞뒤 문장을 함께 읽어 보세요.",
    };
  }

  if (vocabContextAccuracy >= 80 || (synonymRecognition && vocabContextAccuracy >= 70)) {
    return {
      good: randomPick([
        "글의 중요한 낱말을 정확하게 찾았어요.",
        "문맥 속에서 단어 뜻을 잘 이해했어요.",
        "핵심어를 잘 잡아내는 힘이 좋아요.",
      ]),
      improve: randomPick([
        "단어가 문장 안에서 어떻게 쓰이는지까지 함께 살펴보면 어휘력이 더 깊어질 수 있어요.",
        "비슷한 뜻의 낱말까지 함께 비교해 보면 어휘의 폭이 더 넓어질 수 있어요.",
      ]),
      tip: "모르는 단어가 나오면 앞뒤 문장을 함께 읽어 보세요.",
    };
  }

  if (vocabContextAccuracy >= 60) {
    return {
      good: randomPick([
        "핵심 단어를 잘 찾아내며 글의 중심을 따라갔어요.",
        "중요한 낱말에 주목하며 읽은 점이 좋아요.",
      ]),
      improve: "단어의 뜻을 문장 속에서 이해하는 연습을 더 해보면 좋아요.",
      tip: "모르는 단어가 나오면 앞뒤 문장을 함께 읽어 보세요.",
    };
  }

  return {
    good: randomPick([
      "핵심 단어를 찾으려는 집중력이 좋았어요.",
      "글의 중요한 낱말에 관심을 갖고 읽은 점이 좋아요.",
    ]),
    improve: "단어의 뜻을 문장 속에서 이해하는 연습을 더 해보면 좋아요.",
    tip: "모르는 단어가 나오면 앞뒤 문장을 함께 읽어 보세요.",
  };
}

function buildComprehensionFeedback(input: ReportCommentBuilderInput): AreaFeedback {
  const readingQuizAccuracy = toSafePercent(input.readingQuizAccuracy, 0);

  if (readingQuizAccuracy >= 90) {
    return {
      good: randomPick([
        "글의 중심 내용을 아주 잘 이해했어요.",
        "사건의 흐름을 정확하게 파악했어요.",
      ]),
      improve: randomPick([
        "세부 내용을 다시 확인하는 습관을 더하면 이해력이 더욱 단단해질 수 있어요.",
        "근거 문장을 다시 짚어 보는 습관을 더하면 더 또렷하게 이해할 수 있어요.",
      ]),
      tip: "읽고 난 뒤 한 문장으로 내용을 정리해 보세요.",
    };
  }

  if (readingQuizAccuracy >= 70) {
    return {
      good: randomPick([
        "전체 흐름을 잘 따라오며 내용을 이해했어요.",
        "글의 중심 내용을 비교적 정확하게 파악했어요.",
      ]),
      improve: randomPick([
        "세부 내용에서 조금 헷갈린 부분이 있었어요.",
        "내용을 다시 한 번 천천히 정리해 보면 좋아요.",
      ]),
      tip: "읽고 난 뒤 한 문장으로 내용을 정리해 보세요.",
    };
  }

  if (readingQuizAccuracy >= 50) {
    return {
      good: randomPick([
        "끝까지 읽으며 내용을 따라가려는 힘이 좋아요.",
        "중요한 내용을 붙잡으려는 노력이 잘 보였어요.",
      ]),
      improve: randomPick([
        "세부 내용에서 조금 헷갈린 부분이 있었어요.",
        "내용을 다시 한 번 천천히 정리해 보면 좋아요.",
      ]),
      tip: "읽고 난 뒤 한 문장으로 내용을 정리해 보세요.",
    };
  }

  return {
    good: randomPick([
      "끝까지 읽고 문제에 도전한 점이 참 좋아요.",
      "글의 흐름을 붙잡아 보려는 시도가 좋아요.",
    ]),
    improve: randomPick([
      "내용을 다시 한 번 천천히 정리해 보면 좋아요.",
      "중심 내용을 다시 떠올리며 읽어 보면 이해가 더 또렷해질 수 있어요.",
    ]),
    tip: "읽고 난 뒤 한 문장으로 내용을 정리해 보세요.",
  };
}

function buildExpressionFeedback(input: ReportCommentBuilderInput): AreaFeedback {
  const summaryLength = Math.max(0, toSafeNumber(input.summaryLength, 0));
  const summaryKeywordCount = Math.max(0, toSafeNumber(input.summaryKeywordCount, 0));
  const properLength = summaryLength >= 40 && summaryLength <= 140;
  const shortLength = summaryLength > 0 && summaryLength < 40;
  const longLength = summaryLength > 140;
  const hasEnoughKeywords = summaryKeywordCount >= 2;

  if (hasEnoughKeywords && properLength) {
    return {
      good: randomPick([
        "중요한 내용을 빠뜨리지 않고 잘 정리했어요.",
        "자신의 문장으로 내용을 자연스럽게 표현했어요.",
      ]),
      improve: randomPick([
        "문장을 연결하는 표현을 조금 더 다듬으면 전달력이 더욱 좋아질 수 있어요.",
        "핵심 내용을 먼저 두고 생각을 덧붙이면 더 매끄럽게 표현할 수 있어요.",
      ]),
      tip: "요약하기 전에 중요한 단어를 먼저 떠올려 보세요.",
    };
  }

  if (properLength) {
    return {
      good: randomPick([
        "자신의 문장으로 내용을 차분하게 정리했어요.",
        "요약의 흐름을 스스로 만들어 낸 점이 좋아요.",
      ]),
      improve:
        "요약에 중요한 단어가 조금 더 들어가면 내용을 더 또렷하게 전달할 수 있어요.",
      tip: "요약하기 전에 중요한 단어를 먼저 떠올려 보세요.",
    };
  }

  if (shortLength) {
    return {
      good: randomPick([
        "핵심 내용을 짧게라도 정리해 보려는 시도가 좋아요.",
        "내용을 자신의 말로 옮기려는 노력이 잘 보였어요.",
      ]),
      improve: "내용을 조금 더 자세히 써 보면 좋아요.",
      tip: "요약하기 전에 중요한 단어를 먼저 떠올려 보세요.",
    };
  }

  if (longLength) {
    return {
      good: randomPick([
        "생각을 풍부하게 풀어 쓴 점이 좋아요.",
        "떠오른 내용을 충분히 써 내려간 점이 인상적이에요.",
      ]),
      improve: "핵심 내용만 남겨 더 간단히 정리해 보세요.",
      tip: "요약하기 전에 중요한 단어를 먼저 떠올려 보세요.",
    };
  }

  return {
    good: randomPick([
      "자신의 문장으로 표현해 보려는 태도가 좋아요.",
      "내용을 글로 옮기려는 시도가 참 좋아요.",
    ]),
    improve: "요약에 중요한 단어가 조금 더 들어가면 좋아요.",
    tip: "요약하기 전에 중요한 단어를 먼저 떠올려 보세요.",
  };
}

function buildThinkingFeedback(input: ReportCommentBuilderInput): AreaFeedback {
  const inferenceAccuracy = toSafePercent(input.inferenceAccuracy, 0);
  const thinkingNoteQuality = toSafePercent(input.thinkingNoteQuality, 0);
  const inferenceGood = inferenceAccuracy >= 70;
  const noteGood = thinkingNoteQuality >= 70;

  if (inferenceGood && noteGood) {
    return {
      good: randomPick([
        "글에 직접 나오지 않은 내용까지 생각해 보았어요.",
        "자신의 생각을 근거와 함께 잘 표현했어요.",
      ]),
      improve: randomPick([
        "생각의 근거를 한 문장만 더 덧붙이면 사고력이 더 또렷하게 드러날 수 있어요.",
        "이유를 조금 더 자세히 쓰면 생각이 더욱 선명해질 수 있어요.",
      ]),
      tip: "나는 ~~라고 생각한다. 왜냐하면 ~~ 때문이다. 형식으로 생각을 써 보세요.",
    };
  }

  if (inferenceGood || noteGood) {
    return {
      good: randomPick([
        "글을 읽고 자신의 생각을 연결해 보려는 힘이 좋아요.",
        "근거를 떠올리며 생각을 확장해 보려는 태도가 좋아요.",
      ]),
      improve: "왜 그렇게 생각했는지 이유를 더 자세히 써 보면 좋아요.",
      tip: "나는 ~~라고 생각한다. 왜냐하면 ~~ 때문이다. 형식으로 생각을 써 보세요.",
    };
  }

  return {
    good: randomPick([
      "질문을 끝까지 읽고 자신의 생각을 적어 보려는 점이 좋아요.",
      "생각을 글로 표현하려는 시도가 아주 좋아요.",
    ]),
    improve: "왜 그렇게 생각했는지 이유를 더 자세히 써 보면 좋아요.",
    tip: "나는 ~~라고 생각한다. 왜냐하면 ~~ 때문이다. 형식으로 생각을 써 보세요.",
  };
}

export function buildLearningReportComment(
  input: ReportCommentBuilderInput
): LearningReportComment {
  const readingCpm = Math.max(0, toSafeNumber(input.readingCpm, 0));
  const readingDurationSec = Math.max(0, toSafeNumber(input.readingDurationSec, 0));
  const quizAccuracy = buildAccuracy(input.quizCorrect, input.quizTotal);
  const speedBand = getSpeedBand(readingCpm);
  const accuracyBand = getAccuracyBand(quizAccuracy);
  const timeBand = getTimeBand(readingDurationSec, readingCpm, input.passageChars);
  const speedComment = buildSpeedComment(speedBand);
  const timeComment = buildTimeComment(timeBand, accuracyBand);
  const summaryCore = buildSummaryMessage(accuracyBand, speedBand);
  const summaryComment = `${summaryCore} ${timeComment}`.trim();
  const hasDetailedFeedback =
    input.contentType === "long_story" ||
    input.contentType === "category" ||
    input.contentType === "digital";

  const result: LearningReportComment = {
    algorithmVersion: ALGORITHM_VERSION,
    summaryComment: summaryComment || DEFAULT_SUMMARY,
    speedComment: speedComment || DEFAULT_SPEED,
    timeComment: timeComment || DEFAULT_TIME,
    vocabularyFeedback: hasDetailedFeedback
      ? buildVocabularyFeedback(input)
      : null,
    comprehensionFeedback: hasDetailedFeedback
      ? buildComprehensionFeedback(input)
      : null,
    expressionFeedback: hasDetailedFeedback
      ? buildExpressionFeedback(input)
      : null,
    thinkingFeedback: hasDetailedFeedback
      ? buildThinkingFeedback(input)
      : null,
    hasDetailedFeedback,
  };

  if (hasDetailedFeedback) {
    result.vocabularyFeedback ??= DEFAULT_AREA_FEEDBACK;
    result.comprehensionFeedback ??= DEFAULT_AREA_FEEDBACK;
    result.expressionFeedback ??= DEFAULT_AREA_FEEDBACK;
    result.thinkingFeedback ??= DEFAULT_AREA_FEEDBACK;
  }

  console.log("[ReportCommentBuilder]", {
    algorithm_version: ALGORITHM_VERSION,
    contentType: input.contentType,
    quizAccuracy,
    speedBand,
    timeBand,
  });

  return result;
}
