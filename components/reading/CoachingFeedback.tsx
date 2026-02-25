"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { WPMTier } from "@/lib/hooks/useWPM";

interface CoachingFeedbackProps {
  wpm: number;
  tier: WPMTier;
  quizCorrect: number;
  quizTotal: number;
}

function getFeedbackMessage(
  tier: WPMTier,
  quizCorrect: number,
  quizTotal: number
): string {
  const rate = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;
  const speedComment =
    tier === "느림"
      ? "꼼꼼하게 읽었어요."
      : tier === "보통"
        ? "적당한 속도로 잘 읽었어요."
        : "조금만 더 천천히 읽어 보면 이해도가 올라갈 거예요.";
  const quizComment =
    rate >= 80
      ? `퀴즈도 ${rate}% 맞춰서 대단해요!`
      : rate >= 60
        ? `퀴즈 ${rate}% 맞췄어요. 조금만 더 복습해 보면 좋겠어요.`
        : "퀴즈를 다시 한번 읽어 보면 좋겠어요.";
  return `${speedComment} ${quizComment}`;
}

export default function CoachingFeedback({
  wpm,
  tier,
  quizCorrect,
  quizTotal,
}: CoachingFeedbackProps) {
  const [avatarError, setAvatarError] = useState(false);
  const message = getFeedbackMessage(tier, quizCorrect, quizTotal);

  return (
    <section className="rounded-2xl border-2 border-ttodock-orange bg-soft-orange p-6 sm:p-8 mt-10">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ttodock-orange/30 bg-white shadow-sm">
          {!avatarError ? (
            <Image
              src="/images/character.png"
              alt="똑똑이"
              width={80}
              height={80}
              className="object-cover object-top"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="text-4xl" aria-hidden>
              🦊
            </span>
          )}
        </span>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold text-[#212529] text-lg mb-2">
            똑똑이의 코칭
          </p>
          <p className="text-[#212529] font-medium leading-relaxed mb-6">
            {message}
          </p>
          <Link
            href="/mypage"
            className="inline-flex items-center rounded-xl bg-ttodock-orange px-6 py-3 font-bold text-white shadow-sm hover:opacity-90"
          >
            마이페이지 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
