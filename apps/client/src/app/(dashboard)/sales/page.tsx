"use client";

import { useEffect } from "react";

import { Card, EmptyState } from "@inventra/ui";
import { buildReceiptNumber, formatCurrency, formatDateTime } from "@inventra/utils";

import { AuthGuard } from "../../../components/auth/auth-guard";
import { PageHeader } from "../../../components/shared/page-header";
import { LoadingScreen } from "../../../components/shared/loading-screen";
import { useAuth } from "../../../hooks/use-auth";
import { useAppDispatch, useAppSelector } from "../../../hooks/use-app-store";
import { markSalesSeen } from "../../../store/slices/sales-slice";

export default function SalesPage() {
  const { token } = useAuth();
  const dispatch = useAppDispatch();
  const sales = useAppSelector((state) => state.sales.items);
  const newSalesCount = useAppSelector((state) => state.sales.newSalesCount);
  const loading = useAppSelector((state) => Boolean(token) && !state.sales.hasLoadedOnce);

  useEffect(() => {
    dispatch(markSalesSeen());
  }, [dispatch]);

  return (
    <AuthGuard roles={["SHOP_OWNER"]}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Sales History"
          title="Receipts and transaction totals"
          description="Review completed checkouts and use receipt ids when customers need support."
          actions={newSalesCount > 0 ? <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">{newSalesCount} new</span> : undefined}
        />

        {loading && sales.length === 0 ? (
          <LoadingScreen />
        ) : sales.length === 0 ? (
          <EmptyState title="No completed sales" description="Sales will appear here after your first checkout." />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 text-left">
                <thead className="bg-stone-50">
                  <tr className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    <th className="px-6 py-4">Receipt</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-5 font-semibold text-ink">{buildReceiptNumber(sale.id)}</td>
                      <td className="px-6 py-5 text-sm text-stone-500">{formatDateTime(sale.createdAt)}</td>
                      <td className="px-6 py-5 text-sm text-stone-500">{sale.items.length}</td>
                      <td className="px-6 py-5 font-semibold text-ink">{formatCurrency(sale.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
