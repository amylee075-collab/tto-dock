"use client";

import { useSession } from "next-auth/react";
import { useRef, useState, useEffect } from "react";
import { getChallengeData, CHALLENGE_STORAGE_KEY } from "@/lib/challenge-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";

const ORANGE = "#ff5700";

export default function MigrationPrompt() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const askedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session || askedRef.current) return;
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(CHALLENGE_STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as { totalSentencesRead?: number; quizTotal?: number };
      const hasData =
        (Number(data?.totalSentencesRead) ?? 0) > 0 || (Number(data?.quizTotal) ?? 0) > 0;
      if (hasData) {
        askedRef.current = true;
        setOpen(true);
      }
    } catch {
      // ignore
    }
  }, [status, session]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const data = getChallengeData();
      const res = await fetch("/api/migrate-learning-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
      <DialogContent className="sm:max-w-md" onClose={handleCancel}>
        <DialogHeader>
          <DialogTitle>이전 학습 기록 연동</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          이 기기에서 저장된 학습 기록이 있습니다. 서버에 연동하시겠습니까?
        </p>
        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-semibold text-[#212529] hover:bg-gray-50 disabled:opacity-60"
          >
            아니오
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-xl px-5 py-2.5 font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: ORANGE }}
          >
            {loading ? "연동 중..." : "예, 연동할게요"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
