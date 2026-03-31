"use client";

import { AuthGuard } from "../../../components/auth/auth-guard";
import { ShopDashboardPanel } from "../../../components/dashboard/shop-dashboard-panel";
import { PageHeader } from "../../../components/shared/page-header";
import { LoadingScreen } from "../../../components/shared/loading-screen";
import { LinkButton } from "../../../components/shared/link-button";
import { useAuth } from "../../../hooks/use-auth";
import { useAppSelector } from "../../../hooks/use-app-store";
import { selectShopDashboardMetrics } from "../../../store/slices/sales-slice";

export default function DashboardPage() {
  const { token } = useAuth();
  const data = useAppSelector(selectShopDashboardMetrics);
  const loading = useAppSelector(
    (state) => Boolean(token) && (!state.inventory.hasLoadedOnce || !state.sales.hasLoadedOnce)
  );

  return (
    <AuthGuard roles={["SHOP_OWNER"]}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Owner Dashboard"
          title="Your shop at a glance"
          description="Monitor stock health, track revenue, and keep your best-selling items moving."
          actions={<LinkButton href="/pos" label="Open POS" />}
        />

        {loading ? <LoadingScreen /> : <ShopDashboardPanel data={data} />}
      </div>
    </AuthGuard>
  );
}
