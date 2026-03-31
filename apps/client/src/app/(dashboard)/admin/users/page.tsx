"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Card, EmptyState } from "@inventra/ui";
import { formatDateTime, formatRoleLabel } from "@inventra/utils";

import { AuthGuard } from "../../../../components/auth/auth-guard";
import { LoadingScreen } from "../../../../components/shared/loading-screen";
import { PageHeader } from "../../../../components/shared/page-header";
import { useAuth } from "../../../../hooks/use-auth";
import { getApiErrorMessage, useListUsersQuery } from "../../../../store/api";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { data: users = [], error, isFetching, isLoading } = useListUsersQuery(undefined, {
    skip: !token
  });

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error, "Unable to load users"));
    }
  }, [error]);

  return (
    <AuthGuard roles={["SUPER_ADMIN"]}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Admin"
          title="Manage users"
          description="Review account ownership, roles, and the most recent user activity timestamps."
        />

        {(isLoading || isFetching) && users.length === 0 ? (
          <LoadingScreen />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Users will appear here once accounts are created." />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 text-left">
                <thead className="bg-stone-50">
                  <tr className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-5 font-semibold text-ink">{user.name}</td>
                      <td className="px-6 py-5 text-sm text-stone-500">{user.email}</td>
                      <td className="px-6 py-5 text-sm text-stone-500">{formatRoleLabel(user.role)}</td>
                      <td className="px-6 py-5 text-sm text-stone-500">{formatDateTime(user.createdAt)}</td>
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
