import { notFound } from "next/navigation";
import { getDigitalStoryById } from "@/lib/data";
import { getContentFromSupabase } from "@/lib/content-from-supabase";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DigitalStoryPage({ params }: PageProps) {
  const { id } = await params;
  const storyFromSupabase = await getContentFromSupabase("digital", id);
  const story = storyFromSupabase ?? getDigitalStoryById(id);

  if (!story) notFound();

  return (
    <SetBreadcrumbTitle title={story.title}>
      <ShortStoryPageClient story={story} source="digital" />
    </SetBreadcrumbTitle>
  );
}
