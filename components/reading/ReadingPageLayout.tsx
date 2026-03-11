"use client";

import { motion } from "framer-motion";

interface ReadingPageLayoutProps {
  children: React.ReactNode;
}

export default function ReadingPageLayout({ children }: ReadingPageLayoutProps) {
  return (
    <motion.div
      className="min-h-[calc(100vh-4rem)] bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="w-full max-w-[1440px] mx-auto px-0 py-3 md:py-4">
        {children}
      </div>
    </motion.div>
  );
}
