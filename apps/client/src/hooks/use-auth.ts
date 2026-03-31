"use client";

import { useMemo } from "react";

import { useAppSelector } from "./use-app-store";

export function useAuth() {
  const auth = useAppSelector((state) => state.auth);

  return useMemo(
    () => ({
      ...auth,
      token: auth.session?.accessToken ?? null,
      user: auth.session?.user ?? null,
      isAuthenticated: Boolean(auth.session)
    }),
    [auth]
  );
}
