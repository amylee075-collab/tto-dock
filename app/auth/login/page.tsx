"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const ORANGE = "#ff5700";

/** 로그인이 필요한 경로(reading/[id] 한 단계)면 허브로, 아니면 callback 또는 /reading */
function getCloseHref(callbackUrl: string): string {
  if (!callbackUrl || callbackUrl === "/") return "/reading";
  if (!callbackUrl.startsWith("/reading")) return "/reading";
  const after = callbackUrl.replace(/^\/reading\/?/, "").split("/").filter(Boolean);
  if (after.length === 1) return "/reading";
  return callbackUrl;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const closeHref = useMemo(() => getCloseHref(callbackUrl), [callbackUrl]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      setError("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto px-4 py-10">
      <a
        href={closeHref}
        className="absolute right-4 top-6 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#212529] transition-colors inline-flex"
        aria-label="닫기"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </a>
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2 text-center">로그인</h1>
      <p className="text-gray-500 text-sm mb-8 text-center">또독에 오신 것을 환영해요.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#212529] mb-1.5">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#212529] placeholder-gray-400 focus:border-[#ff5700] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/20"
            placeholder="example@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#212529] mb-1.5">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#212529] placeholder-gray-400 focus:border-[#ff5700] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/20"
            placeholder="비밀번호"
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
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-8">
        <p className="text-center text-sm text-gray-500 mb-4">또는</p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-3.5 font-semibold text-[#212529] hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          구글 간편 로그인
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        계정이 없으신가요?{" "}
        <Link href="/auth/signup" className="font-semibold text-[#ff5700] hover:underline">
          회원가입
        </Link>
      </p>

      <a
        href={closeHref}
        className="mt-6 w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors inline-flex items-center justify-center"
      >
        비회원으로 계속하기
      </a>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-10 text-center text-gray-500">로딩 중...</div>}>
      <LoginForm />
    </Suspense>
  );
}
