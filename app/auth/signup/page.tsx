"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

const ORANGE = "#ff5700";

const TERMS_SERVICE = `
제1조 (목적)
본 약관은 또독(이하 "서비스")이 제공하는 모든 서비스의 이용 조건 및 절차, 회원과 서비스의 권리·의무를 규정함을 목적으로 합니다.

제2조 (서비스의 제공)
서비스는 다음과 같은 콘텐츠 및 기능을 제공합니다.
- 읽기 학습 콘텐츠
- 퀴즈 및 학습 기록
- 마이페이지 및 통계

제3조 (이용자의 의무)
이용자는 서비스를 이용할 때 관계 법령 및 본 약관을 준수하여야 합니다.
`;

const TERMS_PRIVACY = `
제1조 (개인정보의 수집 및 이용)
서비스는 회원가입 시 이메일, 비밀번호 등 필요한 최소한의 정보를 수집합니다.

제2조 (개인정보의 보호)
수집된 개인정보는 암호화 등 기술적·관리적 조치를 통해 안전하게 보관됩니다.

제3조 (개인정보의 제3자 제공)
서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 법령에 의한 경우 등 예외가 있는 경우 해당 법령에 따릅니다.
`;

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [age14Checked, setAge14Checked] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeService, setAgreeService] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);
  const router = useRouter();

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeService(checked);
    setAgreePrivacy(checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setError("");
    if (!age14Checked) {
      setError("만 14세 이상에 동의해 주세요.");
      return;
    }
    if (!agreeService || !agreePrivacy) {
      setError("필수 약관에 모두 동의해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "가입에 실패했습니다.");
        submittingRef.current = false;
        setLoading(false);
        return;
      }
      setSuccess(true);
      // 가입 직후 자동 로그인
      const signInResult = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl: "/",
        redirect: false,
      });
      if (signInResult?.ok) {
        router.push("/");
        router.refresh();
        return;
      }
      // 이메일 인증 필요 등으로 로그인 실패 시: 안내만 표시
      setSuccess(true);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm max-w-md w-full text-center">
          <p className="text-lg font-semibold text-[#212529] mb-4">가입이 완료되었습니다.</p>
          <p className="text-gray-600 mb-6">로그인 후 서비스를 이용해 주세요.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: ORANGE }}
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2 text-center">회원가입</h1>
      <p className="text-gray-500 text-sm mb-8 text-center">또독과 함께 읽기 습관을 만들어 보세요.</p>

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
          <p className="mt-1 text-xs text-gray-500">예: name@example.com (공백 없이 입력)</p>
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
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#212529] placeholder-gray-400 focus:border-[#ff5700] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/20"
            placeholder="8자 이상"
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-[#212529] mb-1.5">
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#212529] placeholder-gray-400 focus:border-[#ff5700] focus:outline-none focus:ring-2 focus:ring-[#ff5700]/20"
            placeholder="비밀번호 다시 입력"
          />
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={age14Checked}
              onChange={(e) => setAge14Checked(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-[#ff5700] focus:ring-[#ff5700]"
            />
            <span className="text-sm font-medium text-[#212529]">만 14세 이상입니다 (필수)</span>
          </label>
          <p className="mt-2 text-xs text-gray-500 ml-7">
            만 14세 미만 아동은 법정대리인 동의가 필요합니다.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-gray-200 p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeAll}
              onChange={(e) => handleAgreeAll(e.target.checked)}
              className="rounded border-gray-300 text-[#ff5700] focus:ring-[#ff5700]"
            />
            <span className="font-semibold text-[#212529]">전체 동의</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeService}
              onChange={(e) => {
                const v = e.target.checked;
                setAgreeService(v);
                setAgreeAll(v && agreePrivacy);
              }}
              className="rounded border-gray-300 text-[#ff5700] focus:ring-[#ff5700]"
            />
            <span className="text-[#212529]">서비스 이용약관 (필수)</span>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-sm text-[#ff5700] font-medium hover:underline ml-auto"
                >
                  전문 보기
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>서비스 이용약관</DialogTitle>
                </DialogHeader>
                <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans">
                  {TERMS_SERVICE}
                </pre>
              </DialogContent>
            </Dialog>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => {
                const v = e.target.checked;
                setAgreePrivacy(v);
                setAgreeAll(agreeService && v);
              }}
              className="rounded border-gray-300 text-[#ff5700] focus:ring-[#ff5700]"
            />
            <span className="text-[#212529]">개인정보 처리방침 (필수)</span>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-sm text-[#ff5700] font-medium hover:underline ml-auto"
                >
                  전문 보기
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>개인정보 처리방침</DialogTitle>
                </DialogHeader>
                <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans">
                  {TERMS_PRIVACY}
                </pre>
              </DialogContent>
            </Dialog>
          </label>
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
          {loading ? "가입 처리 중..." : "가입하기"}
        </button>
      </form>

      <div className="mt-8">
        <p className="text-center text-sm text-gray-500 mb-4">또는</p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-3.5 font-semibold text-[#212529] hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          구글 간편 로그인
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/auth/login" className="font-semibold text-[#ff5700] hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
