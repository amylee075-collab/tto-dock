"use server";

import { revalidatePath } from "next/cache";

export type ContentType = "short" | "category" | "digital";

/**
 * Admin 등에서 콘텐츠 저장 후 호출하면 해당 경로 캐시를 즉시 무효화합니다.
 * - type만 넘기면 해당 목록 + 모든 상세 페이지 무효화
 * - id까지 넘기면 해당 상세 페이지 + 해당 목록 무효화
 */
export async function revalidateContentPaths(
  type: ContentType,
  id?: string
): Promise<{ revalidated: string[] }> {
  const paths: string[] = [];

  const listPath = `/reading/${type}`;
  paths.push(listPath);
  revalidatePath(listPath);

  if (id) {
    const detailPath = `/reading/${type}/${id}`;
    paths.push(detailPath);
    revalidatePath(detailPath);
  } else {
    // id 없으면 해당 타입 전체 상세는 태그로 무효화 불가하므로 목록만
    // 필요 시 revalidatePath(`/reading/${type}`, "page") 등 조합 가능
  }

  return { revalidated: paths };
}

/**
 * 모든 읽기 목록·상세 캐시 무효화 (전체 갱신 시 사용)
 */
export async function revalidateAllReadingPaths(): Promise<{ revalidated: string[] }> {
  const types: ContentType[] = ["short", "category", "digital"];
  const paths: string[] = ["/reading", "/reading/short", "/reading/category", "/reading/digital"];

  paths.forEach((p) => revalidatePath(p));
  types.forEach((t) => revalidatePath(`/reading/${t}`));

  return { revalidated: paths };
}
