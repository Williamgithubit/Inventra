"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { AuthGuard } from "../../../components/auth/auth-guard";
import { AdminDashboardPanel } from "../../../components/dashboard/admin-dashboard-panel";
import { LinkButton } from "../../../components/shared/link-button";
import { LoadingScreen } from "../../../components/shared/loading-screen";
import { PageHeader } from "../../../components/shared/page-header";
import { useAuth } from "../../../hooks/use-auth";
import { getApiErrorMessage, useGetAdminDashboardQuery } from "../../../store/api";

export default function AdminPage() {
  const { token } = useAuth();
  const { data, error, isFetching, isLoading } = useGetAdminDashboardQuery(undefined, {
    skip: !token
  });

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error, "Unable to load admin dashboard"));
    }
  }, [error]);

  return (
    <AuthGuard roles={["SUPER_ADMIN"]}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Super Admin"
          title="Platform-wide visibility"
          description="Track all shops, oversee subscriptions, and support operators from one command center."
          actions={
            <>
              <LinkButton href="/admin/users" label="Manage Users" variant="ghost" />
              <LinkButton href="/admin/shops" label="Manage Shops" />
            </>
          }
        />

        {((isLoading || isFetching) && !data) ? <LoadingScreen /> : null}
        {data ? <AdminDashboardPanel data={data} /> : null}
      </div>
    </AuthGuard>
  );
}
