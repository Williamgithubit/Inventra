import type { AdminDashboardMetrics } from "@inventra/types";
import { Badge, Card, StatCard } from "@inventra/ui";

export function AdminDashboardPanel({ data }: { data: AdminDashboardMetrics }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Shops" value={String(data.totalShops)} helper="All onboarded shops" />
        <StatCard label="Users" value={String(data.totalUsers)} helper="All accounts in the system" />
        <StatCard label="Active Subs" value={String(data.activeSubscriptions)} helper="Currently paid" />
        <StatCard label="Past Due" value={String(data.pastDueSubscriptions)} helper="Needs follow-up" />
      </div>

      <Card className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Recent Shops</p>
          <h2 className="mt-2 font-display text-3xl text-ink">New storefronts on the platform</h2>
        </div>

        <div className="space-y-3">
          {data.recentShops.map((shop) => (
            <div key={shop.id} className="rounded-2xl border border-stone-200 px-4 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-ink">{shop.name}</p>
                  <p className="text-sm text-stone-500">
                    {shop.owner?.name} • {shop.owner?.email}
                  </p>
                </div>
                <Badge tone={shop.subscription?.status === "PAST_DUE" ? "danger" : "success"}>
                  {shop.subscription?.status ?? "TRIAL"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
