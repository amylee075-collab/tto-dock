import type { Metadata } from "next";
import "./globals.css";
import SideNav from "@/components/common/SideNav";
import BottomNav from "@/components/common/BottomNav";
import MobileNavDrawer from "@/components/common/MobileNavDrawer";
import MobileReadingTopNav from "@/components/common/MobileReadingTopNav";
import MainContentArea from "@/components/common/MainContentArea";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import Breadcrumbs from "@/components/Breadcrumbs";
import SessionProvider from "@/components/providers/SessionProvider";

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
      <head>
        <meta charSet="utf-8" />
        <title>또박또박 읽기, 또독!</title>
      </head>
      <body className="h-screen antialiased font-pretendard bg-white overflow-hidden">
        <SessionProvider>
          <SidebarProvider>
            <SideNav />
          <MobileNavDrawer />
          {/* LNB 제외 오른쪽 영역 = 메인 (PC에서 패딩 260px/80px 토글) */}
          <MainContentArea>
            <main className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
              <div id="main-scroll-area" className="flex-1 overflow-y-auto min-h-0">
                <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-5 pt-2 pb-[calc(12px+3.5rem)] md:pb-3">
                  <BreadcrumbProvider>
                    <MobileReadingTopNav />
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
