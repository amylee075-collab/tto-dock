"use client";

import Image from "next/image";
import { useState } from "react";

interface MypageHeaderProps {
  title: string;
  nickname: string;
}

export default function MypageHeader({ title, nickname }: MypageHeaderProps) {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="font-extrabold text-2xl text-[#212529]">{title}</h1>
        <p className="mt-1 text-gray-600 font-medium">{nickname}님</p>
      </div>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-100 bg-soft-orange shadow-sm">
        {!avatarError ? (
          <Image
            src="/images/character.png"
            alt="똑똑이"
            width={56}
            height={56}
            className="w-full h-auto object-contain object-top"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <span className="text-2xl" aria-hidden>
            🦊
          </span>
        )}
      </span>
    </header>
  );
}
