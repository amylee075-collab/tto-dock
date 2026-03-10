/**
 * 난이도 숫자(1~3) 또는 텍스트('쉬움','보통','어려움')를 별표 문자열로 변환.
 * ★ U+2605 BLACK STAR, ☆ U+2606 WHITE STAR — UTF-8 인코딩으로 깨지지 않음.
 */
const STAR_FULL = "\u2605"; // ★
const STAR_EMPTY = "\u2606"; // ☆

const TEXT_TO_LEVEL: Record<string, 1 | 2 | 3> = {
  쉬움: 1,
  보통: 2,
  어려움: 3,
};

/**
 * '쉬움'|'보통'|'어려움' 또는 1|2|3 → 1|2|3 정규화. 그 외는 null.
 */
export function normalizeDifficultyToLevel(value: unknown): 1 | 2 | 3 | null {
  if (value == null) return null;
  const s = typeof value === "string" ? value.trim() : "";
  if (s && TEXT_TO_LEVEL[s] != null) return TEXT_TO_LEVEL[s];
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 3) return n as 1 | 2 | 3;
  return null;
}

export function difficultyToStars(level: number): string {
  const n = Number(level);
  if (n >= 3) return `${STAR_FULL}${STAR_FULL}${STAR_FULL}`;
  if (n === 2) return `${STAR_FULL}${STAR_FULL}${STAR_EMPTY}`;
  if (n === 1) return `${STAR_FULL}${STAR_EMPTY}${STAR_EMPTY}`;
  return "";
}

/**
 * 난이도 값(쉬움/보통/어려움 또는 1/2/3)을 별표 문자열로 변환.
 */
export function difficultyToStarsFromAny(value: unknown): string {
  const level = normalizeDifficultyToLevel(value);
  return level != null ? difficultyToStars(level) : "";
}

export function isValidDifficulty(value: unknown): value is 1 | 2 | 3 {
  return normalizeDifficultyToLevel(value) != null;
}
