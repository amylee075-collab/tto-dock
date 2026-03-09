import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** Vercel/Next 서버에서 캐시 없이 항상 최신 데이터를 가져오기 위한 fetch (no-store) */
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

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
