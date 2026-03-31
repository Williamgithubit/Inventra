import { Hono } from "hono";
import { z } from "zod";

import { idParamSchema, productFormSchema, productIdPayloadSchema } from "@inventra/types";

import { requireAuth } from "../middleware/auth";
import { success } from "../lib/http";
import type { AppBindings } from "../types/hono";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct
} from "../services/product-service";

const createSchema = productFormSchema.extend({
  shopId: z.string().uuid().optional()
});

export const productRoutes = new Hono<AppBindings>();

productRoutes.use("*", requireAuth);

productRoutes.get("/", async (c) => {
  const authUser = c.get("authUser");
  const products = await listProducts(authUser, c.req.query("shopId"));
  return success(c, products);
});

productRoutes.get("/:id", async (c) => {
  const authUser = c.get("authUser");
  const params = idParamSchema.parse(c.req.param());
  const product = await getProductById(authUser, params.id);
  return success(c, product);
});

productRoutes.post("/", async (c) => {
  const authUser = c.get("authUser");
  const body = createSchema.parse(await c.req.json());
  const { shopId, ...productInput } = body;
  const product = await createProduct(authUser, productInput, shopId);
  return success(c, product, "Product created successfully", 201);
});

productRoutes.post("/scan", async (c) => {
  const authUser = c.get("authUser");
  const { productId } = productIdPayloadSchema.parse(await c.req.json());
  const product = await getProductById(authUser, productId);
  return success(c, product);
});

productRoutes.put("/:id", async (c) => {
  const authUser = c.get("authUser");
  const params = idParamSchema.parse(c.req.param());
  const body = productFormSchema.parse(await c.req.json());
  const product = await updateProduct(authUser, params.id, body);
  return success(c, product, "Product updated successfully");
});

productRoutes.delete("/:id", async (c) => {
  const authUser = c.get("authUser");
  const params = idParamSchema.parse(c.req.param());
  const result = await deleteProduct(authUser, params.id);
  return success(c, result, "Product deleted successfully");
});
