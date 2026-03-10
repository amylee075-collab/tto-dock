import { notFound } from "next/navigation";
import { getContentFromSupabase } from "@/lib/content-from-supabase";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LongStoryPage({ params }: PageProps) {
  const { id } = await params;
  const story = await getContentFromSupabase("long", id);
  if (!story) notFound();

  const hasQuizFromSource =
    (story.readQuizzes?.length ?? 0) > 0 && !!story.coreQuiz?.question;

  return (
    <SetBreadcrumbTitle title={story.title}>
      {!hasQuizFromSource && (
        <p className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
          퀴즈가 등록되지 않았습니다. 어드민에서 퀴즈를 등록해 주세요.
        </p>
      )}
      <ShortStoryPageClient story={story} source="long" />
    </SetBreadcrumbTitle>
  );
}
