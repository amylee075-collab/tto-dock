import ReadingHub from "@/components/reading/ReadingHub";

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "또독 읽기 | 또독",
  description: "짧은 글, 긴 글, 분야별·디지털 읽기 학습을 만나 보세요.",
};

export default function ReadingHubPage() {
  return <ReadingHub />;
}
