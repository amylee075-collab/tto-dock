import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MypageProfilePage() {
  redirect("/mypage/info/edit");
}
