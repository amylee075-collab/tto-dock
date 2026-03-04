"use client";

import Image from "next/image";
import { useState } from "react";

export default function HeroSection() {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <section
      className="relative rounded-2xl border-[3px] border-ttodock-orange bg-[#fff5f0] p-6 sm:p-8 shadow-sm mb-8"
      aria-label="오늘의 단어"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-xl sm:text-2xl text-[#212529]">
            오늘의 단어
          </h2>
          <p className="mt-2 text-[#212529] font-medium text-base">
            또독이와 함께 읽기 연습을 시작해 보세요.
          </p>
        </div>
        <div className="absolute top-6 right-6 sm:relative sm:top-0 sm:right-0 shrink-0">
          <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full border-2 border-ttodock-orange/30 bg-white shadow-sm">
            {!avatarError ? (
              <Image
                src="/images/character.png"
                alt="또독이"
                width={80}
                height={80}
                className="object-cover object-top"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-3xl sm:text-4xl" aria-hidden>
                🐱
              </span>
            )}
          </span>
        </div>
      </div>
    </section>
  );
}
