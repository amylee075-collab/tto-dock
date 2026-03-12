"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ReadingStartOverlayProps {
  visible: boolean;
  onStart: () => void;
}

export default function ReadingStartOverlay({
  visible,
  onStart,
}: ReadingStartOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-white/65 px-4 py-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="mx-4 flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/80 bg-white/90 px-6 py-7 text-center shadow-lg shadow-black/5"
          >
            <p className="text-lg font-semibold leading-relaxed text-[#212529]">
              글을 읽을 준비가 되었다면
            </p>
            <p className="mt-2 text-lg font-semibold leading-relaxed text-[#212529]">
              [읽기 시작] 버튼을 눌러주세요.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="mt-6 min-h-[48px] rounded-xl bg-[#ff5700] px-8 py-3 text-base font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
            >
              읽기 시작
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
