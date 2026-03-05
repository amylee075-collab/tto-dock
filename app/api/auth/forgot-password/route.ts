import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

/** 이메일 형식 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.json(
      { error: "설정 오류입니다. Supabase URL과 anon 키를 확인해 주세요." },
      { status: 500 }
    );
  }
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "가입 시 사용한 이메일 주소를 입력해 주세요." },
        { status: 400 }
      );
    }
    const baseUrl =
      request.headers.get("origin") ||
      request.headers.get("x-forwarded-host")?.replace(/^/, "https://") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const redirectTo = `${baseUrl.replace(/\/$/, "")}/auth/set-password`;
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      return NextResponse.json(
        { error: "재설정 메일 발송에 실패했습니다. 이메일을 확인하거나 나중에 다시 시도해 주세요." },
        { status: 400 }
      );
    }
    return NextResponse.json({
      ok: true,
      message: "해당 이메일로 비밀번호 재설정 링크를 보냈습니다. 메일함(스팸 포함)을 확인해 주세요.",
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
