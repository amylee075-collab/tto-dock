"use client";

import { useEffect, type ReactNode } from "react";
import { useBreadcrumbTitle } from "@/contexts/BreadcrumbContext";

interface SetBreadcrumbTitleProps {
  title: string;
  children: ReactNode;
}

/** 상세 페이지에서 브레드크럼 마지막 항목 제목을 설정하는 래퍼 */
export default function SetBreadcrumbTitle({ title, children }: SetBreadcrumbTitleProps) {
  const setTitle = useBreadcrumbTitle();
  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [title, setTitle]);
  return <>{children}</>;
}
