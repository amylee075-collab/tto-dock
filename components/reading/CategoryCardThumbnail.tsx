"use client";

import { useState } from "react";
import Image from "next/image";

const DUMMY_THUMB_BY_SECTION: Record<"과학" | "역사" | "사회", string> = {
  과학: "/images/dummy-science.png",
  역사: "/images/dummy-history.png",
  사회: "/images/dummy-social.png",
};

interface CategoryCardThumbnailProps {
  section: "과학" | "역사" | "사회";
  alt?: string;
  sizes?: string;
}

export default function CategoryCardThumbnail({
  section,
  alt = "",
  sizes = "(max-width:640px) 100vw, 50vw",
}: CategoryCardThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const src = DUMMY_THUMB_BY_SECTION[section];

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <span className="text-5xl sm:text-6xl font-bold text-gray-300" aria-hidden>
          !
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
