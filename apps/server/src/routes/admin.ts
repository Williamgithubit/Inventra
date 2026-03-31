import { Hono } from "hono";

import { subscriptionUpdateSchema, superAdminSetupSchema } from "@inventra/types";

import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { success } from "../lib/http";
import type { AppBindings } from "../types/hono";
import { setupSuperAdmin } from "../services/admin-setup-service";
import { listShops, listUsers, updateSubscription } from "../services/admin-service";

export const adminRoutes = new Hono<AppBindings>();

adminRoutes.post("/setup", async (c) => {
  const body = superAdminSetupSchema.parse(await c.req.json());
  const result = await setupSuperAdmin(body);

  return success(
    c,
    result,
    result.created ? "Super admin created successfully" : "Super admin updated successfully",
    result.created ? 201 : 200
  );
});

adminRoutes.get("/users", requireAuth, requireRole("SUPER_ADMIN"), async (c) => {
  const users = await listUsers();
  return success(c, users);
});

adminRoutes.get("/shops", requireAuth, requireRole("SUPER_ADMIN"), async (c) => {
  const shops = await listShops();
  return success(c, shops);
});

adminRoutes.put("/subscriptions", requireAuth, requireRole("SUPER_ADMIN"), async (c) => {
  const body = subscriptionUpdateSchema.parse(await c.req.json());
  const subscription = await updateSubscription(body);
  return success(c, subscription, "Subscription updated successfully");
});
