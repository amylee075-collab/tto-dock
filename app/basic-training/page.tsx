import { redirect } from "next/navigation";

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 레거시/문서용 경로. 실제 기초 훈련은 /practice/core-word 에서 제공.
 * (URL만 유지하고 컨텐츠는 단일 소스 유지)
 */
export default function BasicTrainingPage() {
  redirect("/practice/core-word");
}

