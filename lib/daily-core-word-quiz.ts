import type { CoreWordQuizItem } from "@/lib/coreWordPractice";

const DAILY_COUNT = 10;

/** 서버 시간 기준 오늘 날짜 (KST) YYYY-MM-DD */
export function getTodayKSTDate(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return kst.toISOString().slice(0, 10);
}

/** 시드 기반 결정적 셔플 (같은 시드 → 같은 순서) */
function seededShuffle<T>(seed: string, arr: T[]): T[] {
  const out = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const next = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 0x100000000;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function getQuizId(item: CoreWordQuizItem): string {
  return item.quizId ?? `local-${item.id}`;
}

/**
 * 데일리 10문제 선정 (KST 00:00 기준).
 * - solvedIds 제외 후 랜덤(시드=날짜) 10개.
 * - 미해결 풀이 10개 미만이거나 전부 맞힌 경우 순환: 기존 정답 이력 포함해 10개 채움.
 */
export function getDailyCoreWordQuiz(
  allItems: CoreWordQuizItem[],
  solvedIds: string[],
  dateKST: string
): CoreWordQuizItem[] {
  if (allItems.length === 0) return [];
  const solvedSet = new Set(solvedIds);
  const unsolved = allItems.filter((item) => !solvedSet.has(getQuizId(item)));
  const shuffledUnsolved = seededShuffle(dateKST, unsolved);
  const need = Math.min(DAILY_COUNT, allItems.length);
  if (shuffledUnsolved.length >= need) {
    return shuffledUnsolved.slice(0, need);
  }
  const resultIds = new Set(shuffledUnsolved.map(getQuizId));
  const result = [...shuffledUnsolved];
  const cyclePool = seededShuffle(dateKST + "-cycle", allItems);
  for (const item of cyclePool) {
    if (result.length >= need) break;
    if (!resultIds.has(getQuizId(item))) {
      resultIds.add(getQuizId(item));
      result.push(item);
    }
  }
  return result.slice(0, need);
}

export { DAILY_COUNT };
