"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { UserRole } from "@inventra/types";

import { useAuth } from "../../hooks/use-auth";
import { getDefaultRoute } from "../../lib/navigation";
import { LoadingScreen } from "../shared/loading-screen";

export function AuthGuard({
  children,
  roles
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (roles && user && !roles.includes(user.role)) {
      router.replace(getDefaultRoute(user.role));
    }
  }, [hydrated, isAuthenticated, pathname, roles, router, user]);

  if (!hydrated || !isAuthenticated || (roles && user && !roles.includes(user.role))) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
