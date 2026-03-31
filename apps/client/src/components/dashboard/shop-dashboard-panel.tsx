import type { ShopDashboardMetrics } from "@inventra/types";
import { Card, EmptyState, StatCard } from "@inventra/ui";
import { formatCurrency, formatDateTime } from "@inventra/utils";

export function ShopDashboardPanel({ data }: { data: ShopDashboardMetrics }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Products" value={String(data.totalProducts)} helper="Live inventory count" />
        <StatCard label="Total Sales" value={formatCurrency(data.totalSales)} helper="Gross revenue recorded" />
        <StatCard label="Low Stock Alerts" value={String(data.lowStockCount)} helper="Units at or below threshold" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Recent Transactions</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Latest sales activity</h2>
          </div>

          {data.recentTransactions.length === 0 ? (
            <EmptyState
              title="No sales yet"
              description="Once checkout starts, recent transactions will show up here."
            />
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((sale) => (
                <div key={sale.id} className="rounded-2xl border border-stone-200 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-ink">{formatCurrency(sale.totalAmount)}</p>
                      <p className="text-sm text-stone-500">{formatDateTime(sale.createdAt)}</p>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      {sale.items.length} items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Low Stock</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Items to restock soon</h2>
          </div>

          {data.lowStockProducts.length === 0 ? (
            <EmptyState
              title="Stock looks healthy"
              description="Low stock alerts will appear here when product counts drop."
            />
          ) : (
            <div className="space-y-3">
              {data.lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-ink">{product.name}</p>
                      <p className="text-sm text-stone-500">{formatCurrency(product.price)}</p>
                    </div>
                    <p className="text-sm font-semibold text-amber-700">{product.quantity} left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
