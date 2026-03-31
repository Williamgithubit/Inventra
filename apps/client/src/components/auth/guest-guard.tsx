"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../hooks/use-auth";
import { getDefaultRoute } from "../../lib/navigation";
import { LoadingScreen } from "../shared/loading-screen";

export function GuestGuard({ children }: { children: ReactNode }) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (isAuthenticated) {
      router.replace(getDefaultRoute(user?.role));
    }
  }, [hydrated, isAuthenticated, router, user?.role]);

  if (!hydrated || isAuthenticated) {
    return <LoadingScreen label="Preparing your workspace..." />;
  }

  return <>{children}</>;
}
