"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { StoreProvider } from "../../store/provider";
import { RealtimeBridge } from "./realtime-bridge";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <RealtimeBridge />
      {children}
      <Toaster richColors position="top-right" />
    </StoreProvider>
  );
}
