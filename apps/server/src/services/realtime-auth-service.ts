import { sign } from "hono/jwt";

import type { AuthUser, SupabaseRealtimeAuth } from "@inventra/types";

import { env } from "../env";
import { AppError } from "../lib/errors";

export async function issueSupabaseRealtimeAuth(actor: AuthUser): Promise<SupabaseRealtimeAuth> {
  if (!env.SUPABASE_JWT_SECRET) {
    throw new AppError(
      "Supabase Realtime is not fully configured. Add SUPABASE_JWT_SECRET to apps/server/.env.",
      500
    );
  }

  if (actor.role === "SHOP_OWNER" && !actor.shopId) {
    throw new AppError("Shop scope is required for realtime subscriptions", 403);
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 60 * 60;

  const token = await sign(
    {
      aud: "authenticated",
      exp: expiresAt,
      iat: issuedAt,
      sub: actor.id,
      email: actor.email,
      role: "authenticated",
      shop_id: actor.shopId ?? null,
      user_role: actor.role,
      app_metadata: {
        role: "authenticated"
      },
      user_metadata: {
        name: actor.name,
        shopId: actor.shopId ?? null,
        userRole: actor.role
      }
    },
    env.SUPABASE_JWT_SECRET
  );

  return {
    token,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
    role: actor.role,
    shopId: actor.shopId ?? null,
    lowStockThreshold: env.LOW_STOCK_THRESHOLD
  };
}
