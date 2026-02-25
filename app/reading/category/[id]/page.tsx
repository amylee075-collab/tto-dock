import { notFound } from "next/navigation";
import { getCategoryStoryById } from "@/lib/data";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryStoryPage({ params }: PageProps) {
  const { id } = await params;
  const story = getCategoryStoryById(id);

  if (!story) notFound();

  return (
    <SetBreadcrumbTitle title={story.title}>
      <ShortStoryPageClient story={story} source="category" />
    </SetBreadcrumbTitle>
  );
}
