import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId || !supabaseService) {
    return NextResponse.json(
      { error: "설정 오류입니다. SUPABASE_SERVICE_ROLE_KEY를 확인하세요." },
      { status: 500 }
    );
  }
  try {
    const supabase = createClient(supabaseUrl, supabaseService);
    const { error } = await supabase.from("user_profiles").upsert(
      {
        auth_user_id: userId,
        email: session.user.email,
        terms_agreed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "auth_user_id" }
    );
    if (error) {
      return NextResponse.json(
        { error: error.message || "약관 동의 저장에 실패했습니다." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "서버 오류" },
      { status: 500 }
    );
  }
}
