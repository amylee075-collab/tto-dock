import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateAllPaths } from "@/lib/revalidate-paths";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET?.trim();
const CONTENT_TYPES = ["short", "long", "category", "digital"] as const;

function isAuthorized(request: NextRequest): boolean {
  if (!REVALIDATE_SECRET) return true;
  const auth = request.headers.get("authorization");
  const token = auth?.replace(/^Bearer\s+/i, "").trim();
  if (token === REVALIDATE_SECRET) return true;
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  return secret === REVALIDATE_SECRET;
}

/**
 * On-Demand Revalidation: 어드민 저장 후 또는 배포 후 전체 캐시 초기화.
 * - GET /api/revalidate?secret=xxx — 브라우저/어드민에서 간단 호출
 * - POST body: {} 또는 { type?, id? } — type 없으면 홈+전체 리스트 한꺼번에 무효화
 * 인증: REVALIDATE_SECRET (헤더 Authorization: Bearer 또는 쿼리 secret=)
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const revalidated = revalidateAllPaths();
  return NextResponse.json({ revalidated });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    revalidated.push(...revalidateAllPaths());
  }

  return NextResponse.json({ revalidated });
}
