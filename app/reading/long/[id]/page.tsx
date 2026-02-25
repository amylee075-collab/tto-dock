import { notFound } from "next/navigation";
import { getLongStoryById } from "@/lib/data";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LongStoryPage({ params }: PageProps) {
  const { id } = await params;
  const story = getLongStoryById(id);

  if (!story) notFound();

  return (
    <SetBreadcrumbTitle title={story.title}>
      <ShortStoryPageClient story={story} />
    </SetBreadcrumbTitle>
  );
}
