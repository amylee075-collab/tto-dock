import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeEnv(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "").replace(/\r\n|\n|\r/g, "");
}
const supabaseUrl = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const supabaseAnon = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").replace(/\s+/g, "");
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** 이메일 형식: 로컬@도메인.최상위 (공백 없이, @와 . 포함) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해 주세요." },
        { status: 400 }
      );
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "올바른 이메일 주소를 입력해 주세요. (예: name@example.com)" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json(
        { error: "설정 오류입니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 .env에 넣었는지 확인하세요." },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { emailRedirectTo: undefined },
    });
    if (error) {
      const raw = error.message.toLowerCase();
      const isKeyError = /invalid\s*api\s*key|invalid\s*jwt|api\s*key\s*invalid|missing\s*api\s*key|apikey/i.test(raw);
      const msg = isKeyError
        ? "Supabase API 키 오류입니다. Supabase 대시보드 → 해당 프로젝트 → Settings → API 에서 Project URL과 같은 프로젝트의 anon (public) 키를 복사해 NEXT_PUBLIC_SUPABASE_ANON_KEY에 넣어 주세요. (URL과 anon 키는 반드시 같은 프로젝트 것이어야 합니다.)"
        : raw.includes("already registered") ||
            raw.includes("already exists") ||
            raw.includes("duplicate") ||
            error.code === "user_already_exists"
          ? "이미 가입된 이메일입니다. 로그인해 주세요."
          : raw.includes("invalid") && raw.includes("email")
            ? "올바른 이메일 주소를 입력해 주세요. (예: name@example.com)"
            : error.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (!data.user) {
      return NextResponse.json({ error: "가입 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
    // 어드민에서 회원 목록 조회용 + 약관 동의 시각 저장 (가입 시 약관 동의했으므로 여기서 저장 → 새로고침 시 약관 페이지 재노출 방지)
    if (supabaseService && data.user.id) {
      try {
        const admin = createClient(supabaseUrl, supabaseService);
        const now = new Date().toISOString();
        await admin.from("user_profiles").upsert(
          {
            auth_user_id: data.user.id,
            email: trimmedEmail,
            terms_agreed_at: now,
            updated_at: now,
          },
          { onConflict: "auth_user_id" }
        );
      } catch {
        // 실패해도 가입 성공 응답은 유지
      }
    }
    return NextResponse.json({
      ok: true,
      message: "가입되었습니다.",
      userId: data.user.id,
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
