import MypageDashboard from "@/components/mypage/MypageDashboard";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MypageInfoPage() {
  return (
    <SetBreadcrumbTitle title="내 정보">
      <MypageDashboard />
    </SetBreadcrumbTitle>
  );
}
