import { Badge, Card, StatCard } from "@inventra/ui";

import { LinkButton } from "../components/shared/link-button";
import { SiteHeader } from "../components/layout/site-header";

const features = [
  "Inventory control with QR labels ready for print",
  "Fast POS checkout with real-time stock updates",
  "Receipts and sales history for every transaction",
  "Role-aware dashboards for owners and operators"
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hero-grid">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-8">
        <section className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <Badge tone="warning">Built for neighborhood shops</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-display text-5xl leading-[1.05] text-ink lg:text-7xl">
                Inventory, checkout, and receipts in one calm operating system.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-600">
                Inventra replaces hand-written stock sheets and clumsy cash-wrap workflows with one connected SaaS app for local shops.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <LinkButton href="/register" label="Start Free Trial" />
              <LinkButton href="/pricing" label="See Pricing" variant="ghost" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="rounded-2xl border border-stone-200 bg-white/75 px-4 py-4 text-sm font-semibold text-stone-700 shadow-panel">
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <Card className="space-y-6 bg-[#18120f] text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">Live Snapshot</p>
                <h2 className="mt-2 font-display text-4xl">Mina's Market</h2>
              </div>
              <Badge tone="success">Open</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-300">Today's sales</p>
                <p className="mt-3 font-display text-4xl">$1,248</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-300">Low stock</p>
                <p className="mt-3 font-display text-4xl">6 items</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl bg-white/8 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Basmati Rice 5kg</p>
                    <p className="text-sm text-stone-300">QR label generated</p>
                  </div>
                  <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-900">4 left</span>
                </div>
              </div>
              <div className="rounded-3xl bg-white/8 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Checkout complete</p>
                    <p className="text-sm text-stone-300">Receipt INV-8F52D1AE issued</p>
                  </div>
                  <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900">$32.50</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 py-10 md:grid-cols-3">
          <StatCard label="Setup Time" value="< 30 min" helper="Create products and begin scanning quickly" />
          <StatCard label="Realtime Events" value="Instant" helper="Stock changes stream to active sessions" />
          <StatCard label="Roles" value="2 Core" helper="Shop owner and super admin access built in" />
        </section>
      </main>
    </div>
  );
}
