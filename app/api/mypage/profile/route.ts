import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/auth-options";

function normalizeEnv(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "").replace(/\r\n|\n|\r/g, "");
}

function normalizeNickname(value: string): string {
  return value.trim();
}

function isValidNickname(value: string): boolean {
  return /^[A-Za-z0-9가-힣]+$/.test(value) && value.length >= 1;
}

function getAdminClient() {
  const supabaseUrl = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const supabaseService = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").replace(/\s+/g, "");

  if (!supabaseUrl || !supabaseService) return null;
  return createClient(supabaseUrl, supabaseService);
}

async function getSessionContext() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const provider = (session as { provider?: string } | undefined)?.provider ?? "credentials";

  return {
    session,
    userId,
    provider,
    isGoogleUser: provider === "google",
  };
}

async function checkNicknameDuplicate(supabase: any, nickname: string, userId: string) {
  return supabase
    .from("user_profiles")
    .select("auth_user_id")
    .eq("nickname", nickname)
    .neq("auth_user_id", userId)
    .limit(1);
}

export async function GET(request: Request) {
  const { session, userId, provider, isGoogleUser } = await getSessionContext();

  if (!session?.user?.email || !userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 설정이 없습니다." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const nicknameToCheck = searchParams.get("nickname");

  if (nicknameToCheck !== null) {
    const normalized = normalizeNickname(nicknameToCheck);
    if (!isValidNickname(normalized)) {
      return NextResponse.json(
        { available: false, error: "별명은 한글, 영어, 숫자만 사용할 수 있어요." },
        { status: 400 }
      );
    }

    const { data, error } = await checkNicknameDuplicate(supabase, normalized, userId);
    if (error) {
      return NextResponse.json({ available: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ available: (data ?? []).length === 0 });
  }

  let data: { nickname?: string | null; email?: string | null } | null = null;
  const profileQuery = await supabase
    .from("user_profiles")
    .select("nickname, email")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (profileQuery.error && /nickname/i.test(profileQuery.error.message)) {
    const fallbackQuery = await supabase
      .from("user_profiles")
      .select("email")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (fallbackQuery.error) {
      return NextResponse.json({ error: "프로필 정보를 불러오지 못했어요." }, { status: 500 });
    }

    data = fallbackQuery.data;
  } else if (profileQuery.error) {
    return NextResponse.json({ error: "프로필 정보를 불러오지 못했어요." }, { status: 500 });
  } else {
    data = profileQuery.data;
  }

  const fallbackNickname =
    typeof session.user.name === "string" && session.user.name.trim() ? session.user.name.trim() : "";

  return NextResponse.json({
    profile: {
      nickname: typeof data?.nickname === "string" && data.nickname.trim() ? data.nickname.trim() : fallbackNickname,
      email: typeof data?.email === "string" && data.email.trim() ? data.email.trim() : session.user.email,
      provider,
      emailLocked: isGoogleUser,
      canChangePassword: !isGoogleUser,
    },
  });
}

export async function PATCH(request: Request) {
  const { session, userId, isGoogleUser } = await getSessionContext();

  if (!session?.user?.email || !userId) {
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

  const rawNickname = typeof (body as { nickname?: unknown })?.nickname === "string"
    ? (body as { nickname: string }).nickname
    : "";
  const rawPassword = typeof (body as { password?: unknown })?.password === "string"
    ? (body as { password: string }).password
    : "";

  const nickname = normalizeNickname(rawNickname);
  const password = rawPassword.trim();

  if (!isValidNickname(nickname)) {
    return NextResponse.json(
      { error: "별명은 한글, 영어, 숫자만 사용해 1자 이상 입력해 주세요." },
      { status: 400 }
    );
  }

  if (password && password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  if (isGoogleUser && password) {
    return NextResponse.json({ error: "구글 로그인 계정은 이 화면에서 비밀번호를 변경할 수 없어요." }, { status: 400 });
  }

  const duplicateCheck = await checkNicknameDuplicate(supabase, nickname, userId);
  if (duplicateCheck.error) {
    const isNicknameColumnError = /nickname/i.test(duplicateCheck.error.message);
    return NextResponse.json(
      {
        error: isNicknameColumnError
          ? "닉네임 저장을 위한 설정이 아직 완료되지 않았어요."
          : "별명 확인에 실패했어요.",
      },
      { status: 500 }
    );
  }
  if ((duplicateCheck.data ?? []).length > 0) {
    return NextResponse.json({ error: "이미 사용 중인 별명이에요." }, { status: 409 });
  }

  if (!isGoogleUser && password) {
    const updates: { password?: string } = {};
    if (password) updates.password = password;

    const { error: authError } = await supabase.auth.admin.updateUserById(userId, updates);
    if (authError) {
      return NextResponse.json({ error: "비밀번호를 변경하지 못했어요." }, { status: 500 });
    }
  }

  const nextEmail = session.user.email;
  const { error: upsertError } = await supabase.from("user_profiles").upsert(
    {
      auth_user_id: userId,
      email: nextEmail,
      nickname,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "auth_user_id" }
  );

  if (upsertError) {
    const isNicknameColumnError = /nickname/i.test(upsertError.message);
    return NextResponse.json(
      {
        error: isNicknameColumnError
          ? "닉네임 저장을 위한 설정이 아직 완료되지 않았어요."
          : "프로필 저장에 실패했어요.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    profile: {
      nickname,
      email: nextEmail,
      emailLocked: isGoogleUser,
      canChangePassword: !isGoogleUser,
    },
  });
}
