import GrowthReportDashboard from "@/components/mypage/GrowthReportDashboard";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function GrowthReportPage() {
  return (
    <SetBreadcrumbTitle title="나의 성장 리포트">
      <GrowthReportDashboard />
    </SetBreadcrumbTitle>
  );
}
