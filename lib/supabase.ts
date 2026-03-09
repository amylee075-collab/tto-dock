import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** 전역: 모든 Supabase 요청에 cache: 'no-store' 적용 — Vercel 배포에서도 DB 수정 즉시 반영 */
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
