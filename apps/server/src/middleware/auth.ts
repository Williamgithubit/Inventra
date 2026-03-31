import type { MiddlewareHandler } from "hono";

import { verify } from "hono/jwt";

import { env } from "../env";
import type { AppBindings, JwtClaims } from "../types/hono";
import { AppError } from "../lib/errors";

export const requireAuth: MiddlewareHandler<AppBindings> = async (c, next) => {
  const authorization = c.req.header("Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    throw new AppError("Authentication is required", 401);
  }

  const claims = (await verify(token, env.JWT_SECRET, "HS256")) as unknown as JwtClaims;

  c.set("authUser", {
    id: claims.sub,
    name: claims.name,
    email: claims.email,
    role: claims.role,
    shopId: claims.shopId ?? null
  });

  await next();
};
