import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { emailRedirectTo: undefined },
    });
    if (error) {
      const raw = error.message.toLowerCase();
      const msg =
        raw.includes("already registered") ||
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
    // 어드민에서 회원 목록 조회용: user_profiles에 즉시 반영 (service role)
    if (supabaseService && data.user.id) {
      try {
        const admin = createClient(supabaseUrl, supabaseService);
        await admin.from("user_profiles").upsert(
          {
            auth_user_id: data.user.id,
            email: trimmedEmail,
            updated_at: new Date().toISOString(),
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
