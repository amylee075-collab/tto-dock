"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface VocabularyTooltipProps {
  word: string;
  meaning: string;
  type?: string;
  children: React.ReactNode;
}

export default function VocabularyTooltip({
  word,
  meaning,
  type,
  children,
}: VocabularyTooltipProps) {
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
            className="fixed z-[100] px-3 py-2 rounded-lg bg-[#212529] text-white text-sm font-medium shadow-lg max-w-[90vw] whitespace-normal"
            style={{
              left: position.centerX,
              top: position.top - 8,
              transform: "translate(-50%, -100%)",
            }}
            role="tooltip"
          >
            {type && (
              <span className="text-ttodock-orange/90 text-xs mr-1">[{type}]</span>
            )}
            {meaning}
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
          className="border-b-2 border-ttodock-orange/60 cursor-help font-medium text-ttodock-orange/90 hover:text-ttodock-orange"
        >
          {children}
        </span>
      </span>
      {tooltipPortal}
    </>
  );
}
