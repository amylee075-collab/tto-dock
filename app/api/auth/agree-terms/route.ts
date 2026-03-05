import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/auth-options";

function normalizeEnv(value: string): string {
  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\r\n|\n|\r/g, "");
}
const supabaseUrl = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const supabaseServiceRaw = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabaseService = normalizeEnv(supabaseServiceRaw).replace(/\s+/g, "");

/** JWT payload에서 Supabase 프로젝트 ref 추출 (키가 어떤 프로젝트용인지) */
function getRefFromServiceKey(key: string): string | null {
  try {
    const parts = key.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const padded = payload + "==".slice(0, (4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    return decoded?.ref ?? null;
  } catch {
    return null;
  }
}

/** URL에서 Supabase 프로젝트 ref 추출 (예: https://xxxx.supabase.co → xxxx) */
function getRefFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname || "";
    const match = host.match(/^([a-z]+)\.supabase\.co$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "세션 정보가 없습니다. 다시 로그인해 주세요." }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseService) {
    return NextResponse.json(
      { error: "설정 오류입니다. NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env에 넣었는지 확인하세요. (service_role 키는 anon이 아닌 값입니다.)" },
      { status: 500 }
    );
  }
  const urlRef = getRefFromUrl(supabaseUrl);
  const keyRef = getRefFromServiceKey(supabaseService);
  if (urlRef && keyRef && urlRef !== keyRef) {
    return NextResponse.json(
      {
        error:
          "URL과 service_role 키가 서로 다른 Supabase 프로젝트 것입니다. " +
          "지금 URL은 프로젝트 '" + urlRef + "', 키는 프로젝트 '" + keyRef + "' 용입니다. " +
          "같은 프로젝트의 Settings → API 에서 Project URL과 service_role(Reveal)을 함께 복사해 .env.local에 넣어 주세요.",
      },
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
      const msg = (error.message || "").trim();
      const code = (error as { code?: string }).code ?? "";
      const isKeyError = /invalid\s*api\s*key|invalid\s*jwt|api\s*key\s*invalid|missing\s*api\s*key|apikey/i.test(msg) || code === "PGRST301";
      const isTableMissing = /relation|does not exist|undefined table|42P01/i.test(msg);
      const detail = msg ? ` (Supabase: ${msg})` : "";
      let userMessage: string;
      if (isKeyError) {
        const keyLen = supabaseService.length;
        const hint =
          keyLen < 100
            ? " (키가 짧게 들어갔을 수 있습니다. Reveal 후 전체를 복사하세요.)"
            : " (키는 eyJ로 시작하는 JWT입니다. anon이 아닌 service_role을 넣었는지, 같은 프로젝트 URL인지 확인하세요. 무료 프로젝트는 일시중지되면 키가 안 됩니다.)";
        userMessage =
          "SUPABASE_SERVICE_ROLE_KEY 또는 URL이 맞지 않습니다. Supabase 대시보드 → Settings → API 에서 Project URL과 service_role(Reveal)을 같은 프로젝트에서 다시 복사해 넣어 주세요." +
          hint +
          detail;
      } else if (isTableMissing) {
        userMessage = "user_profiles 테이블이 없습니다. docs/AUTH_SETUP.md 의 SQL로 Supabase에 테이블을 생성해 주세요." + detail;
      } else {
        userMessage = (msg || "약관 동의 저장에 실패했습니다.") + (msg ? "" : "");
      }
      return NextResponse.json({ error: userMessage }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "서버 오류" },
      { status: 500 }
    );
  }
}
