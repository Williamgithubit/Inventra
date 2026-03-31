import { Hono } from "hono";

import { loginSchema, registerSchema } from "@inventra/types";

import { requireAuth } from "../middleware/auth";
import { success } from "../lib/http";
import type { AppBindings } from "../types/hono";
import { login, registerShopOwner } from "../services/auth-service";
import { issueSupabaseRealtimeAuth } from "../services/realtime-auth-service";

export const authRoutes = new Hono<AppBindings>();

authRoutes.post("/register", async (c) => {
  const body = registerSchema.parse(await c.req.json());
  const session = await registerShopOwner(body);
  return success(c, session, "Account created successfully", 201);
});

authRoutes.post("/login", async (c) => {
  const body = loginSchema.parse(await c.req.json());
  const session = await login(body);
  return success(c, session, "Login successful");
});

authRoutes.get("/realtime-token", requireAuth, async (c) => {
  const authUser = c.get("authUser");
  const realtimeAuth = await issueSupabaseRealtimeAuth(authUser);
  return success(c, realtimeAuth);
});
