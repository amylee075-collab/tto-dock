"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthTermsRedirect() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    const needs = (session as { needsTermsAgreement?: boolean })?.needsTermsAgreement;
    if (!needs) return;
    if (pathname?.startsWith("/auth/terms")) return;
    router.replace("/auth/terms");
  }, [status, session, pathname, router]);

  return null;
}
