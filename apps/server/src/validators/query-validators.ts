import { z } from "zod";

/**
 * Validator for shop ID query parameter
 * Used in product listing and other shop-scoped endpoints
 */
export const shopIdQuerySchema = z.object({
  shopId: z.string().uuid("Invalid shop id").optional(),
});

export type ShopIdQuery = z.infer<typeof shopIdQuerySchema>;

/**
 * Validator for product listing query parameters
 */
export const productListQuerySchema = z.object({
  shopId: z.string().uuid("Invalid shop id").optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z
    .enum(["name", "price", "quantity", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

/**
 * Validator for sales listing query parameters
 */
export const salesListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["createdAt", "totalAmount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type SalesListQuery = z.infer<typeof salesListQuerySchema>;

/**
 * Validator for users listing query parameters (admin only)
 */
export const usersListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "email", "role", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  role: z.enum(["SUPER_ADMIN", "SHOP_OWNER"]).optional(),
  search: z.string().trim().optional(),
});

export type UsersListQuery = z.infer<typeof usersListQuerySchema>;

/**
 * Validator for shops listing query parameters (admin only)
 */
export const shopsListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().optional(),
  subscriptionStatus: z
    .enum(["TRIAL", "ACTIVE", "PAST_DUE", "CANCELED"])
    .optional(),
});

export type ShopsListQuery = z.infer<typeof shopsListQuerySchema>;
