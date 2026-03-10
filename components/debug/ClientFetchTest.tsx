"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Row = { id: string; word: string; meaning: string; example: string; type: string };

/**
 * 서버 컴포넌트가 아닌, useEffect로 Supabase에서 직접 가져오는 테스트.
 * 여기서 데이터가 최신이면 → Next.js 서버 사이드 캐싱 문제로 판단.
 */
export default function ClientFetchTest() {
  const [data, setData] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase env not configured");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const at = new Date().toISOString();
    (async () => {
      try {
        const { data: rows, error: e } = await supabase
          .from("today_words")
          .select("id, word, meaning, example, type")
          .order("created_at", { ascending: false });
        if (cancelled) return;
        setFetchedAt(at);
        if (e) {
          setError(e.message);
          setData(null);
        } else {
          setData((rows as Row[]) ?? []);
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-900 mb-2">
        [디버그] 클라이언트 사이드 강제 페칭 (useEffect)
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        서버 렌더가 아닌 브라우저에서 Supabase 직접 조회. 여기서 최신이면 서버 캐싱 문제.
      </p>
      {loading && <p className="text-gray-500">로딩 중...</p>}
      {error && <p className="text-red-600">에러: {error}</p>}
      {fetchedAt && (
        <p className="text-xs text-gray-400 mb-2">조회 시각(UTC): {fetchedAt}</p>
      )}
      {data && (
        <ul className="space-y-2 text-sm">
          {data.slice(0, 10).map((row) => (
            <li key={row.id} className="border-b border-gray-100 pb-2">
              <span className="font-medium">{row.word}</span> — {row.meaning}
            </li>
          ))}
          {data.length > 10 && (
            <li className="text-gray-500">외 {data.length - 10}건</li>
          )}
        </ul>
      )}
    </div>
  );
}
