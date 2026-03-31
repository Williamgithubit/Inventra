"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Badge, Button } from "@inventra/ui";
import { cn, formatRoleLabel } from "@inventra/utils";

import { useAuth } from "../../hooks/use-auth";
import { useAppDispatch, useAppSelector } from "../../hooks/use-app-store";
import { adminNav, ownerNav } from "../../lib/navigation";
import { clearPersistedSession } from "../../lib/session";
import { baseApi } from "../../store/api";
import { clearSession } from "../../store/slices/auth-slice";
import { clearCart } from "../../store/slices/cart-slice";
import { clearInventory } from "../../store/slices/inventory-slice";
import { clearSales, selectNewSalesCount } from "../../store/slices/sales-slice";
import { AuthGuard } from "../auth/auth-guard";
import { Logo } from "./logo";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const newSalesCount = useAppSelector(selectNewSalesCount);

  const navItems = user?.role === "SUPER_ADMIN" ? adminNav : ownerNav;

  function handleLogout() {
    clearPersistedSession();
    dispatch(clearSession());
    dispatch(clearCart());
    dispatch(clearInventory());
    dispatch(clearSales());
    dispatch(baseApi.util.resetApiState());
    router.replace("/login");
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-canvas text-ink">
        <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-stone-200 bg-[#f0e8d8] px-6 py-6 lg:border-b-0 lg:border-r lg:px-8">
            <div className="space-y-8">
              <Logo />
              <div className="rounded-[28px] bg-white/70 p-5 shadow-panel">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Signed In As</p>
                <p className="mt-3 font-display text-2xl">{user?.name}</p>
                <p className="mt-1 text-sm text-stone-500">{user?.email}</p>
                <div className="mt-4">
                  <Badge tone={user?.role === "SUPER_ADMIN" ? "warning" : "success"}>
                    {formatRoleLabel(user?.role ?? "")}
                  </Badge>
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                        active ? "bg-ink text-white" : "text-stone-700 hover:bg-white/70"
                      )}
                    >
                      <span>{item.label}</span>
                      {active ? <span className="text-xs uppercase tracking-[0.18em] text-white/70">Live</span> : null}
                    </Link>
                  );
                })}
              </nav>

              <Button className="w-full" variant="ghost" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </aside>

          <div className="flex min-h-screen flex-col">
            <header className="border-b border-stone-200 bg-canvas/80 px-6 py-4 backdrop-blur lg:px-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Live Operations</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Stock updates and low-stock alerts stream into this workspace automatically.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {user?.role === "SHOP_OWNER" && newSalesCount > 0 ? (
                    <Badge tone="success">{newSalesCount} New Sales</Badge>
                  ) : null}
                  <Badge tone="neutral">Realtime Enabled</Badge>
                </div>
              </div>
            </header>
            <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
