/**
 * 문장에서 vocabulary 단어를 찾아 툴팁용으로 분할
 */

export interface VocabItem {
  word: string;
  meaning: string;
  type: "순우리말" | "한자어" | "외래어";
}

export type Segment = { type: "text"; value: string } | { type: "vocab"; item: VocabItem; value: string };

/** 문장에서 vocabulary에 있는 단어를 찾아 세그먼트 배열로 반환 (긴 단어 우선) */
export function splitByVocabulary(
  sentence: string,
  vocabulary: VocabItem[]
): Segment[] {
  if (!vocabulary?.length) return [{ type: "text", value: sentence }];

  const sorted = [...vocabulary].sort((a, b) => b.word.length - a.word.length);
  const segments: Segment[] = [];
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
