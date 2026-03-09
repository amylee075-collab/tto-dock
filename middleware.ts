import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/auth/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;
      if (pathname.startsWith("/auth/")) return true;
      if (pathname === "/mypage") return !!token;
      return true;
    },
  },
});

export const config = {
  matcher: ["/mypage"],
  // /reading/* 경로는 matcher에 없음 → 캐싱/리다이렉트 없이 통과
};
