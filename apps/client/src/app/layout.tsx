import type { Metadata } from "next";
import type { ReactNode } from "react";

import { APP_NAME } from "@inventra/utils";

import { AppProviders } from "../components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} | Inventory Management and POS`,
  description:
    "Inventra helps local shops manage stock, scan products, process sales, and monitor low inventory in real time."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-canvas font-sans text-ink antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
