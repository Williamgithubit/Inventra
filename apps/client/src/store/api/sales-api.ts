import type { CheckoutInput, Sale } from "@inventra/types";

import { baseApi } from "./base-api";

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSales: builder.query<Sale[], void>({
      query: () => "/sales",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Sale" as const,
                id
              })),
              {
                type: "Sales" as const,
                id: "LIST"
              },
              {
                type: "Dashboard" as const,
                id: "SHOP"
              }
            ]
          : [
              {
                type: "Sales" as const,
                id: "LIST"
              },
              {
                type: "Dashboard" as const,
                id: "SHOP"
              }
            ]
    }),
    getSale: builder.query<Sale, string>({
      query: (saleId) => `/sales/${saleId}`,
      providesTags: (_, __, saleId) => [
        {
          type: "Sale",
          id: saleId
        }
      ]
    }),
    createSale: builder.mutation<Sale, CheckoutInput>({
      query: (body) => ({
        url: "/sales",
        method: "POST",
        body
      }),
      invalidatesTags: [
        {
          type: "Sales",
          id: "LIST"
        },
        {
          type: "Products",
          id: "LIST"
        },
        {
          type: "Dashboard",
          id: "SHOP"
        }
      ]
    })
  })
});

export const { useCreateSaleMutation, useGetSaleQuery, useLazyGetSaleQuery, useLazyListSalesQuery, useListSalesQuery } =
  salesApi;
