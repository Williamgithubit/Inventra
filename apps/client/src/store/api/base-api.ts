import type { ApiResponse, AuthSession } from "@inventra/types";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { ApiClientError } from "./types";
import { getEnvelopeError } from "./types";

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TAG_TYPES = ["Dashboard", "Product", "Products", "Sale", "Sales", "Shop", "Shops", "User", "Users"] as const;

interface AuthStateShape {
  auth?: {
    session?: AuthSession | null;
  };
}

function getApiBaseUrl() {
  const normalizedUrl = DEFAULT_API_URL.replace(/\/+$/, "");

  if (normalizedUrl.endsWith("/api/v1")) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/api/v1`;
}

function toApiClientError(error: FetchBaseQueryError, fallback = "Request failed"): ApiClientError {
  const status = typeof error.status === "number" ? error.status : 500;
  const response = (typeof error.data === "object" ? error.data : undefined) as ApiResponse<unknown> | undefined;

  return {
    status,
    message: response?.error?.message ?? response?.message ?? fallback,
    fieldErrors: response?.error?.fieldErrors
  };
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  cache: "no-store",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as AuthStateShape).auth?.session?.accessToken;

    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }
});

const baseQueryWithEnvelope: BaseQueryFn<string | FetchArgs, unknown, ApiClientError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if ("error" in result && result.error) {
    return {
      error: toApiClientError(result.error)
    };
  }

  const response = result.data as ApiResponse<unknown> | undefined;

  if (!response?.success) {
    return {
      error: getEnvelopeError(response)
    };
  }

  return {
    data: response.data
  };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithEnvelope,
  tagTypes: TAG_TYPES,
  endpoints: () => ({})
});
