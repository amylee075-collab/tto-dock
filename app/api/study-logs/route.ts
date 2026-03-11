import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/auth-options";
import {
  buildStudyLogId,
  normalizeStudyLogRecord,
  normalizeStudyLogRecords,
  type StudyLogRecord,
} from "@/lib/study-log-types";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseService = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

function getAdminClient() {
  if (!supabaseUrl || !supabaseService) return null;
  return createClient(supabaseUrl, supabaseService);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ logs: [] }, { status: 200 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 설정이 없습니다." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const logType = searchParams.get("logType");
  const kstDate = searchParams.get("kstDate");
  const limit = Number(searchParams.get("limit") ?? "0");

  let query = supabase
    .from("study_logs")
    .select("id, user_id, log_type, kst_date, status, content_id, content_type, created_at, updated_at, completed_at, payload")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (logType) query = query.eq("log_type", logType);
  if (kstDate) query = query.eq("kst_date", kstDate);
  if (Number.isFinite(limit) && limit > 0) query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message, logs: [] }, { status: 500 });
  }

  const logs = normalizeStudyLogRecords(
    (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      logType: row.log_type,
      kstDate: row.kst_date,
      status: row.status,
      contentId: row.content_id,
      contentType: row.content_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
      payload: row.payload,
    }))
  );

  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId || !session?.user?.email) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 설정이 없습니다." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const sourceLogs = Array.isArray((body as { logs?: unknown[] })?.logs)
    ? (body as { logs: unknown[] }).logs
    : [(body as { log?: unknown })?.log];

  const logs = sourceLogs
    .map((item) => normalizeStudyLogRecord(item))
    .filter((item): item is StudyLogRecord => item !== null);

  if (!logs.length) {
    return NextResponse.json({ error: "저장할 로그가 없습니다." }, { status: 400 });
  }

  const rows = logs.map((log) => ({
    id: buildStudyLogId({
      userId,
      logType: log.logType,
      kstDate: log.kstDate,
      contentId: log.contentId,
    }),
    user_id: userId,
    log_type: log.logType,
    kst_date: log.kstDate,
    status: log.status,
    content_id: log.contentId ?? null,
    content_type: log.contentType ?? null,
    completed_at: log.completedAt ?? null,
    payload: log.payload,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("study_logs").upsert(rows, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
