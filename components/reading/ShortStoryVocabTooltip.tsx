"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import type { ShortStoryVocabulary } from "@/lib/data";

const FALLBACK_MEANING = "준비 중인 단어입니다.";
const FALLBACK_EXAMPLE = "준비 중입니다.";
const BOTTOM_NAV_SAFE = 80;
const VIEWPORT_MARGIN = 12;
const POPUP_GAP = 12;
const POPUP_MAX_WIDTH = 380;
const ARROW_SAFE_MARGIN = 20;

type TriggerPosition = {
  centerX: number;
  top: number;
  bottom: number;
};

type PopupLayout = {
  left: number;
  top: number;
  maxWidth: number;
  maxHeight: number;
  arrowLeft: number;
  placement: "top" | "bottom";
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
  const [position, setPosition] = useState<TriggerPosition | null>(null);
  const [layout, setLayout] = useState<PopupLayout | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const displayMeaning = item?.meaning?.trim() || FALLBACK_MEANING;
  const displayExample = item?.example?.trim() || FALLBACK_EXAMPLE;

  const closePopup = () => {
    setIsOpen(false);
    setPosition(null);
    setLayout(null);
  };

  const openFromRect = (rect: DOMRect) => {
    setPosition({
      centerX: rect.left + rect.width / 2,
      top: rect.top,
      bottom: rect.bottom,
    });
    setIsOpen(true);
  };

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
        closePopup();
      }
    };
    const closeOnScroll = () => {
      closePopup();
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

  useLayoutEffect(() => {
    if (!isOpen || !position || !popupRef.current || typeof window === "undefined") return;

    const updateLayout = () => {
      if (!popupRef.current) return;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxWidth = Math.min(POPUP_MAX_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);
      const maxHeight = Math.min(400, viewportHeight - VIEWPORT_MARGIN * 2 - BOTTOM_NAV_SAFE);
      const popupWidth = popupRef.current.offsetWidth;
      const popupHeight = popupRef.current.offsetHeight;
      const left = clamp(
        position.centerX - popupWidth / 2,
        VIEWPORT_MARGIN,
        viewportWidth - VIEWPORT_MARGIN - popupWidth
      );
      const safeBottom = viewportHeight - VIEWPORT_MARGIN - BOTTOM_NAV_SAFE;
      const preferredTop = position.top - POPUP_GAP - popupHeight;
      const preferredBottom = position.bottom + POPUP_GAP;
      const canPlaceTop = preferredTop >= VIEWPORT_MARGIN;
      const canPlaceBottom = preferredBottom + popupHeight <= safeBottom;
      const placement: "top" | "bottom" =
        canPlaceTop || !canPlaceBottom ? "top" : "bottom";
      const top =
        placement === "top"
          ? clamp(preferredTop, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, safeBottom - popupHeight))
          : clamp(preferredBottom, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, safeBottom - popupHeight));
      const arrowLeft = clamp(
        position.centerX - left,
        ARROW_SAFE_MARGIN,
        Math.max(ARROW_SAFE_MARGIN, popupWidth - ARROW_SAFE_MARGIN)
      );

      setLayout({ left, top, maxWidth, maxHeight, arrowLeft, placement });
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [isOpen, position]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const nextOpen = !isOpen;
    if (nextOpen) {
      openFromRect(rect);
    } else {
      closePopup();
    }
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
        ref={popupRef}
        className="fixed z-[60] min-w-[200px] max-h-[min(70vh,400px)] overflow-y-auto whitespace-normal rounded-2xl border border-orange-200 bg-white p-5 pb-6 shadow-lg"
        style={{
          left: layout?.left ?? Math.max(VIEWPORT_MARGIN, position.centerX - 160),
          top: layout?.top ?? Math.max(VIEWPORT_MARGIN, position.top - POPUP_GAP - 160),
          maxWidth:
            layout?.maxWidth ??
            (typeof window !== "undefined"
              ? Math.min(POPUP_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2)
              : POPUP_MAX_WIDTH),
          maxHeight: layout?.maxHeight ?? 400,
          visibility: layout ? "visible" : "hidden",
        }}
        role="tooltip"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-[#212529] min-w-0 flex-1">{item?.word ?? children}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closePopup();
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
          className={`absolute -translate-x-1/2 border-[6px] border-transparent ${(layout?.placement ?? "top") === "top" ? "translate-y-full border-t-orange-200" : "-translate-y-full border-b-orange-200"}`}
          style={{ left: layout?.arrowLeft ?? "50%" }}
          aria-hidden
        />
        <span
          className={`absolute -translate-x-1/2 border-[5px] border-transparent ${(layout?.placement ?? "top") === "top" ? "translate-y-[calc(100%-1px)] border-t-white" : "-translate-y-[calc(100%-1px)] border-b-white"}`}
          style={{ left: layout?.arrowLeft ?? "50%" }}
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
                if (nextOpen) {
                  openFromRect(rect);
                } else {
                  closePopup();
                }
                console.log("[ShortStoryVocabTooltip] 선택된 단어 데이터:", {
                  word: item?.word ?? "",
                  meaning: displayMeaning,
                  example: displayExample,
                });
              }
            }
          }}
          className="cursor-pointer font-medium text-[#ff5700]/90 hover:text-[#ff5700]"
          style={{ cursor: "pointer", pointerEvents: "auto" }}
        >
          {children}
        </button>
      </span>
      {popup}
    </>
  );
}
