import type { Metadata } from "next";
import "./globals.css";
import SideNav from "@/components/common/SideNav";
import BottomNav from "@/components/common/BottomNav";
import MobileNavDrawer from "@/components/common/MobileNavDrawer";
import MainContentArea from "@/components/common/MainContentArea";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChallengeTTLGuard from "@/components/ChallengeTTLGuard";
import SessionProvider from "@/components/providers/SessionProvider";
import AuthTermsRedirect from "@/components/auth/AuthTermsRedirect";
import MigrationPrompt from "@/components/auth/MigrationPrompt";

export const metadata: Metadata = {
  title: "또박또박 읽기, 또독!",
  description: "또독이와 함께하는 오늘의 읽기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="h-screen antialiased font-pretendard bg-white overflow-hidden">
        <SessionProvider>
          <AuthTermsRedirect />
          <MigrationPrompt />
          <SidebarProvider>
            <SideNav />
          <MobileNavDrawer />
          {/* LNB 제외 오른쪽 영역 = 메인 (PC에서 패딩 260px/80px 토글) */}
          <MainContentArea>
            <main className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
              <div id="main-scroll-area" className="flex-1 overflow-y-auto min-h-0">
                <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:pl-6 md:pr-6 lg:px-10 xl:px-12 pt-8 pb-32 md:pb-8">
                  <BreadcrumbProvider>
                    <ChallengeTTLGuard />
                    <Breadcrumbs />
                    {children}
                  </BreadcrumbProvider>
                </div>
              </div>
            </main>
          </MainContentArea>
          </SidebarProvider>
          <BottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
