import type { AuthSession, LoginInput, RegisterInput, SupabaseRealtimeAuth } from "@inventra/types";

import { persistSession } from "../../lib/session";
import { baseApi } from "./base-api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, LoginInput>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          persistSession(data);
        } catch {
          return;
        }
      }
    }),
    register: builder.mutation<AuthSession, RegisterInput>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          persistSession(data);
        } catch {
          return;
        }
      }
    }),
    getRealtimeToken: builder.query<SupabaseRealtimeAuth, void>({
      query: () => "/auth/realtime-token"
    })
  })
});

export const { useGetRealtimeTokenQuery, useLazyGetRealtimeTokenQuery, useLoginMutation, useRegisterMutation } =
  authApi;
