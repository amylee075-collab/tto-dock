import type { Metadata } from "next";
import "./globals.css";
import SideNav from "@/components/common/SideNav";
import BottomNav from "@/components/common/BottomNav";
import MobileNavDrawer from "@/components/common/MobileNavDrawer";
import MainContentArea from "@/components/common/MainContentArea";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "또박또박 읽기, 또독!",
  description: "똑똑이와 함께하는 오늘의 읽기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="h-screen antialiased font-pretendard bg-white overflow-hidden">
        <SidebarProvider>
          <SideNav />
          <MobileNavDrawer />
          {/* LNB 제외 오른쪽 영역 = 메인 (PC에서 패딩 260px/80px 토글) */}
          <MainContentArea>
            <main className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="w-full max-w-[1440px] mx-auto pl-14 pr-4 sm:pr-6 md:pl-6 md:pr-6 lg:px-10 xl:px-12 pt-8 pb-20 md:pb-8">
                  <BreadcrumbProvider>
                    <Breadcrumbs />
                    {children}
                  </BreadcrumbProvider>
                </div>
              </div>
            </main>
          </MainContentArea>
        </SidebarProvider>
        <BottomNav />
      </body>
    </html>
  );
}
