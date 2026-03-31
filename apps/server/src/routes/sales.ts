import { Hono } from "hono";

import { checkoutSchema, idParamSchema } from "@inventra/types";

import { requireAuth } from "../middleware/auth";
import { success } from "../lib/http";
import type { AppBindings } from "../types/hono";
import { createSale, getSaleById, listSales } from "../services/sales-service";

export const salesRoutes = new Hono<AppBindings>();

salesRoutes.use("*", requireAuth);

salesRoutes.get("/", async (c) => {
  const authUser = c.get("authUser");
  const sales = await listSales(authUser);
  return success(c, sales);
});

salesRoutes.get("/:id", async (c) => {
  const authUser = c.get("authUser");
  const params = idParamSchema.parse(c.req.param());
  const sale = await getSaleById(authUser, params.id);
  return success(c, sale);
});

salesRoutes.post("/", async (c) => {
  const authUser = c.get("authUser");
  const body = checkoutSchema.parse(await c.req.json());
  const sale = await createSale(authUser, body);
  return success(c, sale, "Sale completed successfully", 201);
});
