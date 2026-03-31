import type { MiddlewareHandler } from "hono";

import type { UserRole } from "@inventra/types";

import type { AppBindings } from "../types/hono";
import { AppError } from "../lib/errors";

export function requireRole(...roles: UserRole[]): MiddlewareHandler<AppBindings> {
  return async (c, next) => {
    const authUser = c.get("authUser");

    if (!roles.includes(authUser.role)) {
      throw new AppError("You do not have access to this resource", 403);
    }

    await next();
  };
}
