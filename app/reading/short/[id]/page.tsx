import { notFound } from "next/navigation";
import { getShortStoryById } from "@/lib/data";
import { getContentFromSupabase } from "@/lib/content-from-supabase";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShortStoryPage({ params }: PageProps) {
  const { id } = await params;
  const storyFromSupabase = await getContentFromSupabase("short", id);
  const localStory = getShortStoryById(id);
  const story = storyFromSupabase ?? localStory;

  if (!story) notFound();

  // Supabase에는 퀴즈 컬럼이 없을 수 있어, 퀴즈가 비어 있으면 로컬 퀴즈로 보강 (완료 후 퀴즈 노출 보장)
  const hasQuizFromSource =
    story.readQuizzes?.length > 0 && story.coreQuiz?.question;
  const mergedStory = !hasQuizFromSource && localStory
    ? { ...story, coreQuiz: localStory.coreQuiz, readQuizzes: localStory.readQuizzes }
    : story;

  return (
    <SetBreadcrumbTitle title={mergedStory.title}>
      <ShortStoryPageClient story={mergedStory} source="short" />
    </SetBreadcrumbTitle>
  );
}
