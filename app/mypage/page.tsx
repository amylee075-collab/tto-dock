import { redirect } from "next/navigation";

/** 정적 배포 방지·캐시 미사용 — 학습 결과 등 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MypagePage() {
  redirect("/mypage/info");
}
