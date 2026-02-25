"use client";

import Image from "next/image";
import { useState } from "react";

interface ThumbnailWithFallbackProps {
  src: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/** 16:9 영역에 채워 넣고, 로드 실패 시 bg-gray-100 + 또독 캐릭터 표시 */
export default function ThumbnailWithFallback({
  src,
  alt = "",
  priority = false,
  sizes = "(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw",
  className = "object-cover",
}: ThumbnailWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <Image
          src="/images/character.png"
          alt=""
          width={64}
          height={64}
          className="w-14 h-14 object-contain opacity-80"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
