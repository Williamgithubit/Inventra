import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { ZodError } from "zod";

import { AppError } from "./errors";

export function success<T>(c: Context, data: T, message?: string, status: ContentfulStatusCode = 200) {
  return c.json(
    {
      success: true,
      message,
      data
    },
    status
  );
}
 
export function toFieldErrors(error: ZodError) {
  return error.flatten().fieldErrors;
}

export function normalizeError(error: unknown) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode as ContentfulStatusCode,
      body: {
        success: false,
        error: {
          message: error.message,
          fieldErrors: error.fieldErrors
        }
      }
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 422 as ContentfulStatusCode,
      body: {
        success: false,
        error: {
          message: "Validation failed",
          fieldErrors: toFieldErrors(error)
        }
      }
    };
  }

  return {
    statusCode: 500 as ContentfulStatusCode,
    body: {
      success: false,
      error: {
        message: "Something went wrong"
      }
    }
  };
}
