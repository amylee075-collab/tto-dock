"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ShortStoryVocabulary } from "@/lib/data";

const FALLBACK_MEANING = "준비 중인 단어입니다.";
const FALLBACK_EXAMPLE = "준비 중입니다.";
const BOTTOM_NAV_SAFE = 80;

function getPopupMaxWidth(centerX: number): string {
  if (typeof window === "undefined") return "85vw";
  const w = window.innerWidth;
  const padding = 16;
  const maxFromCenter = 2 * Math.min(centerX, w - centerX) - padding;
  return `min(85vw, ${Math.max(200, maxFromCenter)}px)`;
}

interface ShortStoryVocabTooltipProps {
  item: ShortStoryVocabulary;
  children: React.ReactNode;
}

export default function ShortStoryVocabTooltip({
  item,
  children,
}: ShortStoryVocabTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ centerX: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const displayMeaning = item?.meaning?.trim() || FALLBACK_MEANING;
  const displayExample = item?.example?.trim() || FALLBACK_EXAMPLE;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setPosition(null);
      }
    };
    const closeOnScroll = () => {
      setIsOpen(false);
      setPosition(null);
    };
    const t = window.setTimeout(() => {
      document.addEventListener("click", close);
      window.addEventListener("scroll", closeOnScroll, { capture: true });
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("click", close);
      window.removeEventListener("scroll", closeOnScroll, { capture: true });
    };
  }, [isOpen]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const nextOpen = !isOpen;
    const centerX = rect.left + rect.width / 2;
    const top = rect.top;
    setPosition(nextOpen ? { centerX, top } : null);
    setIsOpen(nextOpen);
    const payload = {
      word: item?.word ?? "",
      meaning: displayMeaning,
      example: displayExample,
    };
    console.log("[ShortStoryVocabTooltip] 선택된 단어 데이터:", payload);
  };

  const popup =
    typeof document !== "undefined" &&
    document.body &&
    isOpen &&
    position &&
    createPortal(
      <div
        className="fixed z-[60] min-w-[200px] max-h-[min(70vh,400px)] overflow-y-auto whitespace-normal rounded-2xl border border-orange-200 bg-white p-5 pb-6 shadow-lg"
        style={{
          left: position.centerX,
          top:
            typeof window !== "undefined"
              ? Math.min(position.top - 14, window.innerHeight - BOTTOM_NAV_SAFE)
              : position.top - 14,
          transform: "translate(-50%, -100%)",
          maxWidth: getPopupMaxWidth(position.centerX),
        }}
        role="tooltip"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-[#212529] min-w-0 flex-1">{item?.word ?? children}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setPosition(null);
            }}
            className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <p className="mt-1.5 text-xl leading-relaxed font-medium text-gray-700">
          {displayMeaning}
        </p>
        <p className="mt-1.5 text-[1.05rem] leading-relaxed text-orange-700/90">
          예: {displayExample}
        </p>
        <span
          className="absolute left-1/2 -translate-x-1/2 translate-y-full border-[6px] border-transparent border-t-orange-200"
          aria-hidden
        />
        <span
          className="absolute left-1/2 -translate-x-1/2 translate-y-[calc(100%-1px)] border-[5px] border-transparent border-t-white"
          aria-hidden
        />
      </div>,
      document.body
    );

  return (
    <>
      <span className="relative z-10 inline" style={{ pointerEvents: "auto" }}>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                const nextOpen = !isOpen;
                setPosition(
                  nextOpen
                    ? {
                        centerX: rect.left + rect.width / 2,
                        top: rect.top,
                      }
                    : null
                );
                setIsOpen(nextOpen);
                console.log("[ShortStoryVocabTooltip] 선택된 단어 데이터:", {
                  word: item?.word ?? "",
                  meaning: displayMeaning,
                  example: displayExample,
                });
              }
            }
          }}
          className="cursor-pointer border-b-2 border-[#ff5700] font-medium text-[#ff5700]/90 hover:text-[#ff5700]"
          style={{ cursor: "pointer", pointerEvents: "auto" }}
        >
          {children}
        </button>
      </span>
      {popup}
    </>
  );
}
