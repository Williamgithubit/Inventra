import { z } from "zod";

export const USER_ROLES = ["SUPER_ADMIN", "SHOP_OWNER"] as const;
export const SUBSCRIPTION_STATUSES = ["TRIAL", "ACTIVE", "PAST_DUE", "CANCELED"] as const;
export const REALTIME_EVENT_TYPES = ["stock.updated", "stock.low", "sale.created"] as const;

export const userRoleSchema = z.enum(USER_ROLES);
export const subscriptionStatusSchema = z.enum(SUBSCRIPTION_STATUSES);
export const realtimeEventTypeSchema = z.enum(REALTIME_EVENT_TYPES);

export type UserRole = z.infer<typeof userRoleSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type RealtimeEventType = z.infer<typeof realtimeEventTypeSchema>;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: passwordSchema,
  shopName: z.string().trim().min(2, "Shop name is required")
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export const superAdminSetupSchema = z.object({
  setupSecret: z.string().trim().min(1, "Setup secret is required"),
  name: z.string().trim().min(2, "Name is required").optional(),
  email: z.string().email("Enter a valid email address").optional(),
  phone: z.string().trim().min(6, "Phone number is required").optional(),
  password: passwordSchema.optional(),
  sendWelcomeEmail: z.coerce.boolean().default(true),
  avatar: z.string().trim().min(1, "Avatar value is required").optional(),
  avatarPublicId: z.string().trim().min(1, "Avatar public id is required").optional()
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name is required"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative")
});

export const productIdPayloadSchema = z.object({
  productId: z.string().uuid("Invalid product id")
});

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  name: z.string()
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Add at least one product to checkout")
});

export const subscriptionUpdateSchema = z.object({
  shopId: z.string().uuid(),
  status: subscriptionStatusSchema
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid resource id")
});

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  qrCode: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Sale {
  id: string;
  shopId: string;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
}

export interface Subscription {
  id: string;
  shopId: string;
  status: SubscriptionStatus;
  currentPeriodEndsAt: string | null;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  shopId?: string | null;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface CloudinaryAsset {
  publicId: string;
  secureUrl: string;
  bytes: number;
  format: string | null;
  width: number | null;
  height: number | null;
}

export interface AdminSetupEmailDelivery {
  attempted: boolean;
  status: "sent" | "skipped" | "failed";
  recipient: string;
  providerMessageId: string | null;
  error?: string;
}

export interface SuperAdminSetupResult {
  created: boolean;
  phone: string;
  session: AuthSession;
  emailDelivery: AdminSetupEmailDelivery;
  avatarUpload: CloudinaryAsset | null;
}

export interface ShopDashboardMetrics {
  totalProducts: number;
  totalSales: number;
  lowStockCount: number;
  recentTransactions: Sale[];
  lowStockProducts: Product[];
}

export interface AdminDashboardMetrics {
  totalShops: number;
  totalUsers: number;
  activeSubscriptions: number;
  pastDueSubscriptions: number;
  recentShops: ShopSummary[];
}

export interface ShopSummary extends Shop {
  owner?: Pick<User, "id" | "name" | "email">;
  subscription?: Subscription;
}

export interface RealtimeEvent {
  type: RealtimeEventType;
  shopId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface SupabaseRealtimeAuth {
  token: string;
  expiresAt: string;
  role: UserRole;
  shopId: string | null;
  lowStockThreshold: number;
}

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SuperAdminSetupInput = z.infer<typeof superAdminSetupSchema>;
export type ProductFormInput = z.infer<typeof productFormSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>;
export type ProductIdPayload = z.infer<typeof productIdPayloadSchema>;

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
}
