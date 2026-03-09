import { notFound } from "next/navigation";
import { getCategoryStoryById } from "@/lib/data";
import { getContentFromSupabase } from "@/lib/content-from-supabase";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryStoryPage({ params }: PageProps) {
  const { id } = await params;
  const storyFromSupabase = await getContentFromSupabase("category", id);
  const localStory = getCategoryStoryById(id);
  const story = storyFromSupabase ?? localStory;

  if (!story) notFound();

  const hasQuizFromSource =
    story.readQuizzes?.length > 0 && story.coreQuiz?.question;
  const mergedStory = !hasQuizFromSource && localStory
    ? { ...story, coreQuiz: localStory.coreQuiz, readQuizzes: localStory.readQuizzes }
    : story;

  return (
    <SetBreadcrumbTitle title={mergedStory.title}>
      <ShortStoryPageClient story={mergedStory} source="category" />
    </SetBreadcrumbTitle>
  );
}
