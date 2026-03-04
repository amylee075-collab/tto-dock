import { notFound } from "next/navigation";
import { getShortStoryById } from "@/lib/data";
import { getContentFromSupabase } from "@/lib/content-from-supabase";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShortStoryPage({ params }: PageProps) {
  const { id } = await params;
  const storyFromSupabase = await getContentFromSupabase("short", id);
  const story = storyFromSupabase ?? getShortStoryById(id);

  if (!story) notFound();

  return (
    <SetBreadcrumbTitle title={story.title}>
      <ShortStoryPageClient story={story} source="short" />
    </SetBreadcrumbTitle>
  );
}
