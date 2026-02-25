"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type BreadcrumbContextValue = {
  breadcrumbTitle: string | null;
  setBreadcrumbTitle: (title: string | null) => void;
};

export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbTitle, setBreadcrumbTitle] = useState<string | null>(null);
  const setTitle = useCallback((title: string | null) => {
    setBreadcrumbTitle(title);
  }, []);
  return (
    <BreadcrumbContext.Provider
      value={{ breadcrumbTitle, setBreadcrumbTitle: setTitle }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbTitle() {
  const ctx = useContext(BreadcrumbContext);
  return ctx?.setBreadcrumbTitle ?? (() => {});
}
