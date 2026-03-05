"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const ORANGE = "#ff5700";

function parseHash(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!hash || !hash.startsWith("#")) return params;
  hash
    .slice(1)
    .split("&")
    .forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) params[key] = decodeURIComponent(value);
    });
  return params;
}

export default function SetPasswordPage() {
  const [status, setStatus] = useState<"loading" | "form" | "done" | "error">("loading");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = parseHash(hash);
    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;
    const type = params.type;

    if (type !== "recovery" || !accessToken || !refreshToken) {
      setError("잘못된 재설정 링크이거나 만료되었습니다. 비밀번호 찾기에서 다시 요청해 주세요.");
      setStatus("error");
      return;
    }

    const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!urlEnv || !anonEnv) {
      setError("설정 오류입니다.");
      setStatus("error");
      return;
    }

    const supabase = createClient(urlEnv, anonEnv);
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(() => {
        setStatus("form");
        if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname);
      })
      .catch(() => {
        setError("세션 설정에 실패했습니다. 링크가 만료되었을 수 있습니다. 다시 요청해 주세요.");
        setStatus("error");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!urlEnv || !anonEnv) {
      setError("설정 오류입니다.");
      setLoading(false);
      return;
    }
    const supabase = createClient(urlEnv, anonEnv);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || "비밀번호 변경에 실패했습니다.");
      setLoading(false);
      return;
    }
    setStatus("done");
    setLoading(false);
  };

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center text-gray-500">
        확인 중...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="font-extrabold text-2xl text-[#212529] mb-2 text-center">링크 오류</h1>
        <p className="text-red-600 text-sm mb-6 text-center">{error}</p>
        <Link
          href="/auth/forgot-password"
          className="block w-full rounded-xl py-3.5 font-bold text-white text-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: ORANGE }}
        >
          비밀번호 재설정 다시 요청
        </Link>
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/auth/login" className="font-semibold text-[#ff5700] hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="font-extrabold text-2xl text-[#212529] mb-2 text-center">비밀번호가 변경되었습니다</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">새 비밀번호로 로그인해 주세요.</p>
        <Link
          href="/auth/login"
          className="block w-full rounded-xl py-3.5 font-bold text-white text-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: ORANGE }}
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2 text-center">새 비밀번호 설정</h1>
      <p className="text-gray-500 text-sm mb-8 text-center">8자 이상의 새 비밀번호를 입력하세요.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#212529] mb-1.5">
            새 비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#212529] placeholder-gray-400 focus:border-[#ff5700] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/20"
            placeholder="8자 이상"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-[#212529] mb-1.5">
            비밀번호 확인
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#212529] placeholder-gray-400 focus:border-[#ff5700] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/20"
            placeholder="다시 입력"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 font-medium" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: ORANGE }}
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
}
