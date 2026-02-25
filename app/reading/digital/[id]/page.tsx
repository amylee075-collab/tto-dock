import { notFound } from "next/navigation";
import { getDigitalStoryById } from "@/lib/data";
import ShortStoryPageClient from "@/components/reading/ShortStoryPageClient";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DigitalStoryPage({ params }: PageProps) {
  const { id } = await params;
  const story = getDigitalStoryById(id);

  if (!story) notFound();

  return (
    <SetBreadcrumbTitle title={story.title}>
      <ShortStoryPageClient story={story} source="digital" />
    </SetBreadcrumbTitle>
  );
}
