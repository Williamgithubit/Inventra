import type { ApiResponse } from "@inventra/types";

export interface ApiClientError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return typeof error === "object" && error !== null && "message" in error && "status" in error;
}

export function getApiErrorMessage(error: unknown, fallback = "Request failed") {
  if (isApiClientError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

export function getEnvelopeError(
  response: ApiResponse<unknown> | undefined,
  fallback = "Request failed"
): ApiClientError {
  return {
    status: 500,
    message: response?.error?.message ?? response?.message ?? fallback,
    fieldErrors: response?.error?.fieldErrors
  };
}
