import ClientFetchTest from "@/components/debug/ClientFetchTest";

/** 정적 배포 방지·캐시 미사용 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** 임시: 클라이언트에서 useEffect로 데이터를 가져오는 페이지 (서버 캐시 회피 테스트) */
export default function DebugFetchPage() {
  return (
    <div className="w-full min-h-screen py-10 px-4">
      <ClientFetchTest />
    </div>
  );
}
