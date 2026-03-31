"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SUBSCRIPTION_STATUSES, type SubscriptionStatus } from "@inventra/types";
import { Badge, Button, Card, EmptyState } from "@inventra/ui";
import { formatDateTime } from "@inventra/utils";

import { AuthGuard } from "../../../../components/auth/auth-guard";
import { LoadingScreen } from "../../../../components/shared/loading-screen";
import { PageHeader } from "../../../../components/shared/page-header";
import { useAuth } from "../../../../hooks/use-auth";
import { getApiErrorMessage, useListShopsQuery, useUpdateSubscriptionMutation } from "../../../../store/api";

export default function AdminShopsPage() {
  const { token } = useAuth();
  const [pendingShopId, setPendingShopId] = useState<string | null>(null);
  const { data: shops = [], error, isFetching, isLoading } = useListShopsQuery(undefined, {
    skip: !token
  });
  const [updateSubscription, { isLoading: isUpdatingSubscription }] = useUpdateSubscriptionMutation();
  const loading = isLoading || isFetching;

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error, "Unable to load shops"));
    }
  }, [error]);

  async function handleUpdate(shopId: string, status: SubscriptionStatus) {
    try {
      setPendingShopId(shopId);
      await updateSubscription({
        shopId,
        status
      }).unwrap();
      toast.success("Subscription updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update subscription"));
    } finally {
      setPendingShopId(null);
    }
  }

  return (
    <AuthGuard roles={["SUPER_ADMIN"]}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Admin"
          title="Manage shops"
          description="Inspect shop ownership and apply placeholder subscription status changes for the MVP."
        />

        {loading && shops.length === 0 ? (
          <LoadingScreen />
        ) : shops.length === 0 ? (
          <EmptyState title="No shops found" description="Registered shops will appear here." />
        ) : (
          <div className="space-y-4">
            {shops.map((shop) => (
              <Card key={shop.id} className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-display text-3xl text-ink">{shop.name}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      Owner: {shop.owner?.name} • {shop.owner?.email}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">Created: {formatDateTime(shop.createdAt)}</p>
                  </div>
                  <Badge tone={shop.subscription?.status === "PAST_DUE" ? "danger" : "success"}>
                    {shop.subscription?.status ?? "TRIAL"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3">
                  {SUBSCRIPTION_STATUSES.map((status) => (
                    <Button
                      key={status}
                      disabled={pendingShopId === shop.id && isUpdatingSubscription}
                      onClick={() => void handleUpdate(shop.id, status)}
                      variant={status === shop.subscription?.status ? "secondary" : "ghost"}
                    >
                      Set {status}
                    </Button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
