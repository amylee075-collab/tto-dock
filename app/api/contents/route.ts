import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidateAllPaths } from "@/lib/revalidate-paths";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET?.trim();

const CONTENT_TYPES = ["short", "long", "category", "digital"] as const;

type ContentType = (typeof CONTENT_TYPES)[number];

function isValidType(t: unknown): t is ContentType {
  return typeof t === "string" && CONTENT_TYPES.includes(t as ContentType);
}

/**
 * 어드민 콘텐츠 등록/수정 API.
 * POST body에 id가 없거나 비어 있으면 자동으로 UUID를 생성해 넣습니다.
 * (Supabase "null value in column id" 오류 방지)
 *
 * Body: {
 *   id?: string,           // 없으면 자동 생성
 *   type: "short"|"long"|"category"|"digital",
 *   title: string,
 *   content?: string | null,
 *   thumbnail_url?: string | null,
 *   vocabulary?: array | null,
 *   section?: string | null,
 *   badges?: string[] | null,     // Supabase 컬럼명 badges — 분야(비문학, 사회 등) 배열
 *   difficulty?: number | null     // 1|2|3 — 서비스에서 ★☆☆/★★☆/★★★ 로 표시
 * }
 * 인증: REVALIDATE_SECRET 설정 시 Authorization: Bearer <REVALIDATE_SECRET> 필요
 */
export async function POST(request: NextRequest) {
  if (REVALIDATE_SECRET) {
    const auth = request.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "").trim();
    if (token !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!supabaseUrl || !supabaseService) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "본문이 비어 있습니다." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const type = b.type;
  const title = b.title;

  if (!isValidType(type)) {
    return NextResponse.json(
      { error: `type은 ${CONTENT_TYPES.join(", ")} 중 하나여야 합니다.` },
      { status: 400 }
    );
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title은 비어 있으면 안 됩니다." }, { status: 400 });
  }

  const rawId = b.id;
  const id =
    typeof rawId === "string" && rawId.trim() !== ""
      ? rawId.trim()
      : crypto.randomUUID();

  const content = b.content != null ? String(b.content) : null;
  const thumbnail_url = b.thumbnail_url != null ? String(b.thumbnail_url) : null;
  const vocabulary =
    Array.isArray(b.vocabulary) && b.vocabulary.length > 0
      ? b.vocabulary.map((v: unknown) => {
          const item = v && typeof v === "object" && "word" in v ? (v as { word?: unknown; meaning?: unknown; example?: unknown }) : null;
          return item
            ? {
                word: String(item.word ?? ""),
                meaning: String(item.meaning ?? ""),
                example: String(item.example ?? ""),
              }
            : null;
        }).filter(Boolean)
      : null;
  const section =
    typeof b.section === "string" && b.section.trim() !== "" ? b.section.trim() : null;
  const fromBadges = Array.isArray(b.badges) ? (b.badges as unknown[]).filter((x) => typeof x === "string").map(String) : [];
  const fromCategories = Array.isArray(b.categories) ? (b.categories as unknown[]).filter((x) => typeof x === "string").map(String).slice(0, 3) : [];
  const badges = fromBadges.length > 0 ? fromBadges : fromCategories.length > 0 ? fromCategories : null;
  const difficulty =
    typeof b.difficulty === "number" && b.difficulty >= 1 && b.difficulty <= 3 ? b.difficulty : null;

  // 3단계 문해 활동: core_quiz, read_quizzes, summary_quiz (jsonb)
  const core_quiz = b.core_quiz != null && typeof b.core_quiz === "object" ? b.core_quiz : undefined;
  const read_quizzes = Array.isArray(b.read_quizzes) ? b.read_quizzes : undefined;
  const summary_quiz = b.summary_quiz != null && typeof b.summary_quiz === "object" ? b.summary_quiz : undefined;

  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    id,
    type,
    title: title.trim(),
    content,
    thumbnail_url,
    vocabulary,
    section,
    badges,
    difficulty,
    updated_at: now,
  };
  if (core_quiz !== undefined) row.core_quiz = core_quiz;
  if (read_quizzes !== undefined) row.read_quizzes = read_quizzes;
  if (summary_quiz !== undefined) row.summary_quiz = summary_quiz;

  const supabase = createClient(supabaseUrl, supabaseService);
  const { error } = await supabase.from("contents").upsert(row as Record<string, unknown>, {
    onConflict: "id",
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "저장에 실패했습니다." },
      { status: 500 }
    );
  }

  // 어드민 [저장] 시 자동으로 서비스 캐시 삭제 — 전역 경로 revalidate
  const revalidated = revalidateAllPaths();
  return NextResponse.json({ ok: true, id, revalidated });
}
