import type { AdminDashboardMetrics, AuthUser, ShopDashboardMetrics } from "@inventra/types";
import { mapProduct, mapSale, mapShopSummary } from "../lib/mappers";

import { env } from "../env";
import { AppError } from "../lib/errors";
import { supabase } from "../lib/supabase";

export async function getDashboard(actor: AuthUser): Promise<AdminDashboardMetrics | ShopDashboardMetrics> {
  if (actor.role === "SUPER_ADMIN") {
    const [shopsQuery, usersQuery, subscriptionsQuery] = await Promise.all([
      supabase
        .from("shops")
        .select(
          `
          id,
          name,
          owner_id,
          created_at,
          owner:users!shops_owner_id_fkey(id, name, email),
          subscription:subscriptions!subscriptions_shop_id_fkey(
            id,
            shop_id,
            status,
            current_period_ends_at,
            created_at
          )
        `
        )
        .order("created_at", { ascending: false }),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("status")
    ]);

    if (shopsQuery.error || usersQuery.error || subscriptionsQuery.error) {
      throw new AppError(
        shopsQuery.error?.message ?? usersQuery.error?.message ?? subscriptionsQuery.error?.message ?? "Unable to load dashboard",
        500
      );
    }

    const subscriptions = subscriptionsQuery.data ?? [];

    return {
      totalShops: shopsQuery.data?.length ?? 0,
      totalUsers: usersQuery.count ?? 0,
      activeSubscriptions: subscriptions.filter((subscription) => subscription.status === "ACTIVE").length,
      pastDueSubscriptions: subscriptions.filter((subscription) => subscription.status === "PAST_DUE").length,
      recentShops: (shopsQuery.data ?? []).slice(0, 6).map((row) => mapShopSummary(row))
    };
  }

  if (!actor.shopId) {
    throw new AppError("Shop is not attached to this account", 403);
  }

  const [productsQuery, salesQuery] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("shop_id", actor.shopId)
      .order("created_at", { ascending: false }),
    supabase
      .from("sales")
      .select(
        `
        id,
        shop_id,
        total_amount,
        created_at,
        items:sale_items!sale_items_sale_id_fkey(
          id,
          sale_id,
          product_id,
          quantity,
          price,
          product:products!sale_items_product_id_fkey(
            id,
            name,
            price,
            quantity,
            qr_code,
            shop_id,
            created_at,
            updated_at
          )
        )
      `
      )
      .eq("shop_id", actor.shopId)
      .order("created_at", { ascending: false })
  ]);

  if (productsQuery.error || salesQuery.error) {
    throw new AppError(productsQuery.error?.message ?? salesQuery.error?.message ?? "Unable to load dashboard", 500);
  }

  const products = (productsQuery.data ?? []).map((row) => mapProduct(row));
  const sales = (salesQuery.data ?? []).map((row) => mapSale(row));

  return {
    totalProducts: products.length,
    totalSales: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    lowStockCount: products.filter((product) => product.quantity <= env.LOW_STOCK_THRESHOLD).length,
    recentTransactions: sales.slice(0, 5),
    lowStockProducts: products.filter((product) => product.quantity <= env.LOW_STOCK_THRESHOLD).slice(0, 6)
  };
}
