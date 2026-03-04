import { notFound } from "next/navigation";
import { getCategoryStoryById } from "@/lib/data";
import { getContentFromSupabase } from "@/lib/content-from-supabase";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryStoryPage({ params }: PageProps) {
  const { id } = await params;
  const storyFromSupabase = await getContentFromSupabase("category", id);
  const story = storyFromSupabase ?? getCategoryStoryById(id);

  if (!story) notFound();

  return (
    <SetBreadcrumbTitle title={story.title}>
      <ShortStoryPageClient story={story} source="category" />
    </SetBreadcrumbTitle>
  );
}
