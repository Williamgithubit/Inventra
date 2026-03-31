import { z } from "zod";

/**
 * Base pagination schema used across the application
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Sorting schema for list endpoints
 */
export const sortSchema = z.object({
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type Sort = z.infer<typeof sortSchema>;

/**
 * Combined pagination and sorting schema
 */
export const paginationWithSortSchema = paginationSchema.merge(sortSchema);

export type PaginationWithSort = z.infer<typeof paginationWithSortSchema>;

/**
 * Date range filter schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type DateRange = z.infer<typeof dateRangeSchema>;

/**
 * Search schema with optional search term
 */
export const searchSchema = z.object({
  search: z.string().trim().optional(),
});

export type Search = z.infer<typeof searchSchema>;

/**
 * Helper function to extract and validate pagination from query parameters
 */
export function validatePagination(query?: Record<string, string | string[]>) {
  if (!query) return paginationSchema.parse({});
  return paginationSchema.parse({
    page: query.page,
    limit: query.limit,
  });
}

/**
 * Helper function to extract and validate sort parameters from query parameters
 */
export function validateSort(query?: Record<string, string | string[]>) {
  if (!query) return sortSchema.parse({});
  return sortSchema.parse({
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });
}
