import { Hono } from "hono";

import { requireAuth } from "../middleware/auth";
import { success } from "../lib/http";
import type { AppBindings } from "../types/hono";
import { getDashboard } from "../services/dashboard-service";

export const dashboardRoutes = new Hono<AppBindings>();

dashboardRoutes.use("*", requireAuth);

dashboardRoutes.get("/", async (c) => {
  const authUser = c.get("authUser");
  const dashboard = await getDashboard(authUser);
  return success(c, dashboard);
});
