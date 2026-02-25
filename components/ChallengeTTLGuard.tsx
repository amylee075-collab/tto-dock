"use client";

import { useEffect } from "react";
import { ensureChallengeData } from "@/lib/challenge-storage";

/** 앱 로드 시 7일 만료 체크 후 필요 시 localStorage 초기화 */
export default function ChallengeTTLGuard() {
  useEffect(() => {
    ensureChallengeData();
  }, []);
  return null;
}
