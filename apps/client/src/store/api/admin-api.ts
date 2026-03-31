import type { ShopSummary, SubscriptionStatus, User } from "@inventra/types";

import { baseApi } from "./base-api";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<User[], void>({
      query: () => "/admin/users",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "User" as const,
                id
              })),
              {
                type: "Users" as const,
                id: "LIST"
              },
              {
                type: "Dashboard" as const,
                id: "ADMIN"
              }
            ]
          : [
              {
                type: "Users" as const,
                id: "LIST"
              },
              {
                type: "Dashboard" as const,
                id: "ADMIN"
              }
            ]
    }),
    listShops: builder.query<ShopSummary[], void>({
      query: () => "/admin/shops",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Shop" as const,
                id
              })),
              {
                type: "Shops" as const,
                id: "LIST"
              },
              {
                type: "Dashboard" as const,
                id: "ADMIN"
              }
            ]
          : [
              {
                type: "Shops" as const,
                id: "LIST"
              },
              {
                type: "Dashboard" as const,
                id: "ADMIN"
              }
            ]
    }),
    updateSubscription: builder.mutation<void, { shopId: string; status: SubscriptionStatus }>({
      query: (body) => ({
        url: "/admin/subscriptions",
        method: "PUT",
        body
      }),
      invalidatesTags: (_, __, { shopId }) => [
        {
          type: "Shop",
          id: shopId
        },
        {
          type: "Shops",
          id: "LIST"
        },
        {
          type: "Dashboard",
          id: "ADMIN"
        }
      ]
    })
  })
});

export const { useLazyListShopsQuery, useLazyListUsersQuery, useListShopsQuery, useListUsersQuery, useUpdateSubscriptionMutation } =
  adminApi;
