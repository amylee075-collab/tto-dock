"use client";

import Image from "next/image";
import { useState } from "react";

interface CharacterFeedbackProps {
  totalSentencesRead: number;
}

export default function CharacterFeedback({
  totalSentencesRead,
}: CharacterFeedbackProps) {
  const [avatarError, setAvatarError] = useState(false);

  const message =
    totalSentencesRead === 0
      ? "또독이와 함께 첫 번째 글을 읽으러 가볼까요?"
      : totalSentencesRead <= 10
        ? "조금만 더 읽어보면 또독이가 칭찬할 거예요!"
        : `오늘 ${totalSentencesRead}문장을 읽었네요! 대단해요!`;

  const isLongMessage = message.length > 30;

  return (
    <section className="rounded-2xl bg-soft-orange border border-ttodock-orange/10 p-6 sm:p-8 shadow-sm overflow-hidden">
      <div className="flex flex-row items-center gap-4 sm:gap-8 min-w-0">
        <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
          {!avatarError ? (
            <Image
              src="/images/character.png"
              alt="또독이"
              width={96}
              height={96}
              className="w-full h-auto object-contain object-top"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="text-4xl" aria-hidden>
              🦊
            </span>
          )}
        </span>
        <div className="flex-1 min-w-0 flex items-stretch">
          <div className="relative w-full rounded-2xl border border-ttodock-orange/20 bg-white px-5 py-4 shadow-sm min-h-[2.75rem] flex items-center">
            <p
              className={`font-bold text-[#212529] leading-snug break-words ${
                isLongMessage ? "text-base sm:text-lg" : "text-lg"
              }`}
            >
              {message}
            </p>
            <span
              className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rotate-45 border-l border-b border-ttodock-orange/20 bg-white shrink-0"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
