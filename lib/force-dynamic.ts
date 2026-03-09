import { cookies } from "next/headers";

/**
 * 서버 컴포넌트/데이터 페칭에서 호출 시 해당 요청을 동적 렌더로 만듦.
 * Next.js가 정적 생성하지 않고 매 요청마다 실행하도록 함.
 * Supabase 등 DB 수정 즉시 반영이 필요한 경로에서 사용.
 */
export async function forceDynamic(): Promise<void> {
  await cookies();
}
