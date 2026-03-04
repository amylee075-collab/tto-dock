import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** Supabase 클라이언트 (서버/클라이언트 공용). env가 없으면 null 반환. */
export function getSupabase() {
  if (!url || !key) return null;
  return createClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key);
}
