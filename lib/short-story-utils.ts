import type { ShortStoryVocabulary } from "./data";

/** 본문 문자열을 문장 단위로 분할 (마침표·물음표·느낌표 기준) */
export function splitContentIntoSentences(content: string): string[] {
  return content
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type ShortStorySegment =
  | { type: "text"; value: string }
  | { type: "vocab"; item: ShortStoryVocabulary; value: string };

/** 문장에서 vocabulary 단어를 찾아 세그먼트 배열로 반환 (긴 단어 우선) */
export function splitSentenceByVocabulary(
  sentence: string,
  vocabulary: ShortStoryVocabulary[]
): ShortStorySegment[] {
  if (!vocabulary?.length) return [{ type: "text", value: sentence }];
  const sorted = [...vocabulary].sort((a, b) => b.word.length - a.word.length);
  const segments: ShortStorySegment[] = [];
  let remaining = sentence;

  while (remaining.length > 0) {
    let found = false;
    for (const item of sorted) {
      const idx = remaining.indexOf(item.word);
      if (idx !== -1) {
        if (idx > 0) {
          segments.push({ type: "text", value: remaining.slice(0, idx) });
        }
        segments.push({ type: "vocab", item, value: item.word });
        remaining = remaining.slice(idx + item.word.length);
        found = true;
        break;
      }
    }
    if (!found) {
      segments.push({ type: "text", value: remaining });
      break;
    }
  }
  return segments;
}
