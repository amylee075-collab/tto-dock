import {
  getCategoryContentsFromSupabase,
  getContentsByTypeFromSupabase,
} from "@/lib/content-from-supabase";
import CategoryListClient from "@/components/reading/CategoryListClient";

/** 정적 배포 방지·캐시 미사용 — 어드민 수정사항 즉시 반영 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "분야별 글 읽기 | 또독",
  description: "과학, 역사, 사회 등 다양한 주제의 글을 읽어 보세요.",
};

export default async function CategoryListPage() {
  const [allStories, initialStories] = await Promise.all([
    getContentsByTypeFromSupabase("category"),
    getCategoryContentsFromSupabase({ filter: "전체", sortBy: "title" }),
  ]);
  const merged = Array.isArray(allStories) ? allStories : [];

  return (
    <>
      {!merged.length ? (
        <p className="text-gray-500 py-6" role="status">
          등록된 분야별 콘텐츠가 없습니다. 어드민에서 새로운 글을 추가해 주세요.
        </p>
      ) : (
        <CategoryListClient stories={merged} initialStories={initialStories} />
      )}
    </>
  );
}
