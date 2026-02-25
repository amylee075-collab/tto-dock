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

  return (
    <section className="rounded-2xl bg-soft-orange border border-ttodock-orange/10 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
          {!avatarError ? (
            <Image
              src="/images/character.png"
              alt="똑똑이"
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
        <div className="flex-1 text-center sm:text-left">
          <div className="relative inline-block rounded-2xl border border-ttodock-orange/20 bg-white px-5 py-4 shadow-sm">
            <p className="font-bold text-[#212529] text-lg leading-snug">
              오늘 {totalSentencesRead}문장을 읽었네요!
              <br />
              대단해요!
            </p>
            <span
              className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rotate-45 border-l border-b border-ttodock-orange/20 bg-white"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
