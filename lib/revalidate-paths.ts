import { revalidatePath } from "next/cache";

/**
 * 홈 + 읽기 목록/상세 + 문해력 기초 + 마이페이지 등 전체 갱신에 사용할 경로 목록.
 * 어드민 저장 시 또는 배포 후 캐시 초기화 시 한꺼번에 무효화.
 */
const GLOBAL_PATHS = [
  "/",
  "/reading",
  "/reading/short",
  "/reading/long",
  "/reading/category",
  "/reading/digital",
  "/practice/core-word",
  "/mypage",
] as const;

export function revalidateAllPaths(): string[] {
  const revalidated: string[] = [];
  for (const p of GLOBAL_PATHS) {
    revalidatePath(p);
    revalidated.push(p);
  }
  return revalidated;
}
