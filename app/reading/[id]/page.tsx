import { redirect } from "next/navigation";
import { getContentById, getPassageById, getTodayPassages } from "@/lib/data";
import ReadingContentExperience from "@/components/reading/ReadingContentExperience";
import CoreWordMode from "@/components/reading/CoreWordMode";
import ReadingExperience from "@/components/reading/ReadingExperience";
import ReadingPageLayout from "@/components/reading/ReadingPageLayout";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";
import { notFound } from "next/navigation";

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** 기존 '긴 글' 지문(토끼와 거북이 등)으로 직접 접속 시 통합된 긴 글 목록으로 리다이렉트 */
const LONG_READING_HREF = "/reading/long";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function ReadingPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { mode } = await searchParams;

  const { long: todayLong } = getTodayPassages();
  if (todayLong && id === todayLong.id) {
    redirect(LONG_READING_HREF);
  }

  const content = getContentById(id);
  const passage = getPassageById(id);

  if (content) {
    const isCoreWord = content.type === "CORE_WORD";
    const hasValidCoreWord =
      isCoreWord &&
      content.selectableWords?.length &&
      content.coreWord &&
      content.selectableWords.includes(content.coreWord);
    if (isCoreWord && hasValidCoreWord) {
      return (
        <ReadingPageLayout>
          <SetBreadcrumbTitle title={content.title}>
            <CoreWordMode content={content} />
          </SetBreadcrumbTitle>
        </ReadingPageLayout>
      );
    }
    if (isCoreWord && !hasValidCoreWord) {
      return (
        <ReadingPageLayout>
          <SetBreadcrumbTitle title={content.title}>
            <div className="py-4 text-gray-500">
              이 콘텐츠는 coreWord가 selectableWords에 포함되도록 설정해 주세요.
            </div>
          </SetBreadcrumbTitle>
        </ReadingPageLayout>
      );
    }
    return (
      <div className="py-6">
        <SetBreadcrumbTitle title={content.title}>
          <ReadingContentExperience content={content} />
        </SetBreadcrumbTitle>
      </div>
    );
  }

  if (passage) {
    const isSummaryMode = mode === "summary";
    return (
      <div className="py-6">
        <SetBreadcrumbTitle title={passage.title}>
          <ReadingExperience
            passage={passage}
            mode={isSummaryMode ? "summary" : "read"}
          />
        </SetBreadcrumbTitle>
      </div>
    );
  }

  notFound();
}
