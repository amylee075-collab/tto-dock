import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET?.trim();
const CONTENT_TYPES = ["short", "category", "digital"] as const;

/**
 * On-Demand Revalidation: Admin 저장 후 또는 Supabase 웹훅에서 호출.
 * POST body: { type?: "short" | "category" | "digital", id?: string }
 * - type만 있으면 해당 목록 + type 전체 무효화
 * - id까지 있으면 해당 상세 페이지도 무효화
 * - type 없이 호출 시 읽기 관련 경로 전체 무효화
 * 헤더: Authorization: Bearer <REVALIDATE_SECRET> (REVALIDATE_SECRET 설정 시 필수)
 */
export async function POST(request: NextRequest) {
  if (REVALIDATE_SECRET) {
    const auth = request.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "").trim();
    if (token !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: { type?: string; id?: string } = {};
  try {
    body = await request.json();
  } catch {
    // body 없으면 전체 무효화
  }

  const type = body.type && CONTENT_TYPES.includes(body.type as (typeof CONTENT_TYPES)[number])
    ? (body.type as (typeof CONTENT_TYPES)[number])
    : null;
  const id = typeof body.id === "string" ? body.id : undefined;

  const revalidated: string[] = [];

  if (type) {
    const listPath = `/reading/${type}`;
    revalidatePath(listPath);
    revalidated.push(listPath);
    if (id) {
      const detailPath = `/reading/${type}/${id}`;
      revalidatePath(detailPath);
      revalidated.push(detailPath);
    }
  } else {
    ["short", "category", "digital"].forEach((t) => {
      revalidatePath(`/reading/${t}`);
      revalidated.push(`/reading/${t}`);
    });
    revalidatePath("/reading");
    revalidated.push("/reading");
  }

  return NextResponse.json({ revalidated });
}
