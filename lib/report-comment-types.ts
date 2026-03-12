export type ReportContentType =
  | "short_story"
  | "long_story"
  | "category"
  | "digital";

export interface AreaFeedback {
  good: string;
  improve: string;
  tip: string;
}

export interface LearningReportComment {
  algorithmVersion: "2.0.0";
  summaryComment: string;
  speedComment: string;
  timeComment: string;
  vocabularyFeedback: AreaFeedback | null;
  comprehensionFeedback: AreaFeedback | null;
  expressionFeedback: AreaFeedback | null;
  thinkingFeedback: AreaFeedback | null;
  hasDetailedFeedback: boolean;
}

export interface ReportCommentBuilderInput {
  contentType: ReportContentType;
  readingCpm?: number | null;
  readingDurationSec?: number | null;
  quizCorrect?: number | null;
  quizTotal?: number | null;
  passageChars?: number | null;
  coreWordCorrect?: boolean | null;
  synonymRecognition?: boolean | null;
  vocabContextAccuracy?: number | null;
  readingQuizAccuracy?: number | null;
  summaryLength?: number | null;
  summaryKeywordCount?: number | null;
  summarySentenceVariety?: number | null;
  inferenceAccuracy?: number | null;
  thinkingNoteQuality?: number | null;
}
