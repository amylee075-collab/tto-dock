import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getContentByIdFromSupabase } from "@/lib/content-from-supabase";

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

/** /reading/[id] — Supabase contents에 있으면 /reading/{type}/{id}로 리다이렉트 */
export default async function ReadingPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getContentByIdFromSupabase(id);
  if (!result) notFound();
  redirect(`/reading/${result.type}/${result.story.id}`);
}
