"use client";

import { useState } from "react";
import Link from "next/link";

const ORANGE = "#ff5700";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "요청에 실패했습니다.");
        return;
      }
      setSent(true);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="font-extrabold text-2xl text-[#212529] mb-2 text-center">이메일을 확인해 주세요</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          해당 이메일로 비밀번호 재설정 링크를 보냈습니다. 메일함(스팸 포함)을 확인한 뒤 링크를 클릭해 새 비밀번호를 설정하세요.
        </p>
        <Link
          href="/auth/login"
          className="block w-full rounded-xl py-3.5 font-bold text-white text-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: ORANGE }}
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2 text-center">비밀번호 재설정</h1>
      <p className="text-gray-500 text-sm mb-8 text-center">가입 시 사용한 이메일을 입력하면 재설정 링크를 보내드립니다.</p>

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
          {loading ? "보내는 중..." : "재설정 링크 받기"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/auth/login" className="font-semibold text-[#ff5700] hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
