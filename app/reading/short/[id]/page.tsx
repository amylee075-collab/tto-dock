import { notFound } from "next/navigation";
import { getShortStoryById } from "@/lib/data";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShortStoryPage({ params }: PageProps) {
  const { id } = await params;
  const story = getShortStoryById(id);

  if (!story) notFound();

  return (
    <SetBreadcrumbTitle title={story.title}>
      <ShortStoryPageClient story={story} />
    </SetBreadcrumbTitle>
  );
}
