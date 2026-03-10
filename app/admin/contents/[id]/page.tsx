import { notFound } from "next/navigation";
import { getContentByIdFromSupabase } from "@/lib/content-from-supabase";
import ContentEditForm from "@/components/admin/ContentEditForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminContentEditPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getContentByIdFromSupabase(id);
  if (!result) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#212529] mb-6">콘텐츠 수정</h1>
        <ContentEditForm initialStory={result.story} contentType={result.type} />
      </div>
    </div>
  );
}
