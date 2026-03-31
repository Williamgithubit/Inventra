import type { AdminDashboardMetrics } from "@inventra/types";

import { baseApi } from "./base-api";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: [
        {
          type: "Dashboard",
          id: "ADMIN"
        }
      ]
    })
  })
});

export const { useGetAdminDashboardQuery, useLazyGetAdminDashboardQuery } = dashboardApi;
