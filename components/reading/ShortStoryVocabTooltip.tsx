"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { ShortStoryVocabulary } from "@/lib/data";

interface ShortStoryVocabTooltipProps {
  item: ShortStoryVocabulary;
  children: React.ReactNode;
}

export default function ShortStoryVocabTooltip({
  item,
  children,
}: ShortStoryVocabTooltipProps) {
  const [position, setPosition] = useState<{ centerX: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = position !== null;

  useEffect(() => {
    if (!show) return;
    const close = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node))
        setPosition(null);
    };
    const closeOnScroll = () => setPosition(null);
    document.addEventListener("click", close);
    window.addEventListener("scroll", closeOnScroll, { capture: true });
    return () => {
      document.removeEventListener("click", close);
      window.removeEventListener("scroll", closeOnScroll, { capture: true });
    };
  }, [show]);

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (position) {
      setPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      centerX: rect.left + rect.width / 2,
      top: rect.top,
    });
  };

  const tooltipPortal =
    typeof document !== "undefined" &&
    createPortal(
      show && position ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed z-[100] w-64 px-3 py-3 rounded-xl bg-[#212529] text-white text-sm shadow-lg"
            style={{
              left: position.centerX,
              top: position.top - 8,
              transform: "translate(-50%, -100%)",
            }}
            role="tooltip"
          >
            <p className="font-medium text-white mb-1">{item.meaning}</p>
            <p className="text-gray-300 text-xs leading-relaxed">
              예: {item.example}
            </p>
          </motion.div>
        </AnimatePresence>
      ) : null,
      document.body
    );

  return (
    <>
      <span ref={triggerRef} className="relative inline">
        <span
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setPosition((p) =>
                  p ? null : { centerX: rect.left + rect.width / 2, top: rect.top }
                );
              }
            }
          }}
          className="border-b-2 border-[#ff5700] cursor-help font-medium text-[#ff5700]/90 hover:text-[#ff5700]"
        >
          {children}
        </span>
      </span>
      {tooltipPortal}
    </>
  );
}
