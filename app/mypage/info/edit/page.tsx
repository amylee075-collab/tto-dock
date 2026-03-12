import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import ProfileEditForm from "@/components/mypage/ProfileEditForm";
import SetBreadcrumbTitle from "@/components/SetBreadcrumbTitle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MypageInfoEditPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  return (
    <SetBreadcrumbTitle title="내 정보 수정">
      <ProfileEditForm />
    </SetBreadcrumbTitle>
  );
}
