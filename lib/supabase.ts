import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** PostgREST는 쿼리 파라미터를 필터로 해석하므로 Supabase URL에는 t= 붙이지 않음 (PGRST100 방지). cache: no-store만 적용 */
const noStoreFetch: typeof fetch = (input, init) => {
  const reqUrl = typeof input === "string" ? input : (input as Request).url;
  const isSupabaseRest = url && reqUrl.startsWith(url) && reqUrl.includes("/rest/v1/");
  const finalUrl = isSupabaseRest ? reqUrl : `${reqUrl}${reqUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
  const nextInput = typeof input === "string" ? finalUrl : new Request(finalUrl, input);
  return fetch(nextInput, { ...init, cache: "no-store" });
};

/** Supabase 클라이언트 (서버/클라이언트 공용). env가 없으면 null 반환. */
export function getSupabase() {
  if (!url || !key) return null;
  return createClient(url, key, {
    global: { fetch: noStoreFetch },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key);
}
