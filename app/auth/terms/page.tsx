"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
`;

export default function TermsAgreementPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeService, setAgreeService] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login?callbackUrl=/auth/terms");
      return;
    }
    if (status === "authenticated" && !(session as { needsTermsAgreement?: boolean })?.needsTermsAgreement) {
      router.replace("/");
    }
  }, [status, session, router]);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeService(checked);
    setAgreePrivacy(checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeService || !agreePrivacy) {
      setError("필수 약관에 모두 동의해 주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/agree-terms", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "저장에 실패했습니다.");
        return;
      }
      await updateSession();
      router.replace("/");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (status !== "authenticated") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-gray-500">확인 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl text-[#212529] mb-2 text-center">약관 동의</h1>
      <p className="text-gray-500 text-sm mb-8 text-center">
        서비스 이용을 위해 아래 약관에 동의해 주세요.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
                <button type="button" className="text-sm text-[#ff5700] font-medium hover:underline ml-auto">
                  전문 보기
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>서비스 이용약관</DialogTitle>
                </DialogHeader>
                <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans">{TERMS_SERVICE}</pre>
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
                <button type="button" className="text-sm text-[#ff5700] font-medium hover:underline ml-auto">
                  전문 보기
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>개인정보 처리방침</DialogTitle>
                </DialogHeader>
                <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans">{TERMS_PRIVACY}</pre>
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
          {loading ? "저장 중..." : "동의하고 계속하기"}
        </button>
      </form>
    </div>
  );
}
