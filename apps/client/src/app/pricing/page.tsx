import { Card } from "@inventra/ui";

import { SiteHeader } from "../../components/layout/site-header";
import { LinkButton } from "../../components/shared/link-button";

const tiers = [
  {
    name: "Starter",
    price: "$19",
    description: "For a single shop getting off spreadsheets.",
    features: ["1 shop", "Inventory + POS", "QR labels", "Sales history"]
  },
  {
    name: "Growth",
    price: "$49",
    description: "For busy local shops with daily checkout volume.",
    features: ["Everything in Starter", "Realtime stock alerts", "Admin oversight", "Priority onboarding"]
  },
  {
    name: "Custom",
    price: "Let's talk",
    description: "For multi-location operators preparing to scale.",
    features: ["Multiple shops", "Custom support", "Advanced workflows", "Migration planning"]
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Pricing</p>
          <h1 className="font-display text-5xl text-ink">Simple pricing for practical retail teams.</h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-stone-600">
            Start on a lightweight plan and grow into deeper operational control when your shop needs it.
          </p>
        </div>

        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Card
              key={tier.name}
              className={index === 1 ? "border-brand-500 bg-[#18120f] text-white" : undefined}
            >
              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">{tier.name}</p>
                  <div className="space-y-2">
                    <h2 className="font-display text-4xl">{tier.price}</h2>
                    <p className={index === 1 ? "text-stone-300" : "text-stone-500"}>{tier.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="rounded-2xl border border-current/10 px-4 py-3 text-sm font-semibold">
                      {feature}
                    </div>
                  ))}
                </div>
                <LinkButton
                  href="/register"
                  label={index === 2 ? "Contact Sales" : "Start Free Trial"}
                  variant={index === 1 ? "secondary" : "primary"}
                  className="w-full"
                />
              </div>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
