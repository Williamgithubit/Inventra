import type { Product, ProductFormInput } from "@inventra/types";

import { baseApi } from "./base-api";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProducts: builder.query<Product[], void>({
      query: () => "/products",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Product" as const,
                id
              })),
              {
                type: "Products" as const,
                id: "LIST"
              },
              {
                type: "Dashboard" as const,
                id: "SHOP"
              }
            ]
          : [
              {
                type: "Products" as const,
                id: "LIST"
              },
              {
                type: "Dashboard" as const,
                id: "SHOP"
              }
            ]
    }),
    getProduct: builder.query<Product, string>({
      query: (productId) => `/products/${productId}`,
      providesTags: (_, __, productId) => [
        {
          type: "Product",
          id: productId
        }
      ]
    }),
    createProduct: builder.mutation<Product, ProductFormInput>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body
      }),
      invalidatesTags: [
        {
          type: "Products",
          id: "LIST"
        },
        {
          type: "Dashboard",
          id: "SHOP"
        }
      ]
    }),
    updateProduct: builder.mutation<Product, { productId: string; payload: ProductFormInput }>({
      query: ({ productId, payload }) => ({
        url: `/products/${productId}`,
        method: "PUT",
        body: payload
      }),
      invalidatesTags: (_, __, { productId }) => [
        {
          type: "Product",
          id: productId
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
    }),
    deleteProduct: builder.mutation<{ id: string }, string>({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "DELETE"
      }),
      invalidatesTags: (_, __, productId) => [
        {
          type: "Product",
          id: productId
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
    }),
    scanProduct: builder.mutation<Product, string>({
      query: (productId) => ({
        url: "/products/scan",
        method: "POST",
        body: {
          productId
        }
      }),
      invalidatesTags: (_, __, productId) => [
        {
          type: "Product",
          id: productId
        }
      ]
    })
  })
});

export const {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductQuery,
  useLazyGetProductQuery,
  useLazyListProductsQuery,
  useListProductsQuery,
  useScanProductMutation,
  useUpdateProductMutation
} = productsApi;
