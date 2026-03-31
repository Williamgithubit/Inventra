import type { ShopSummary, SubscriptionUpdateInput, User } from "@inventra/types";
import { mapShopSummary, mapUser } from "../lib/mappers";

import { AppError } from "../lib/errors";
import { supabase } from "../lib/supabase";

export async function listUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data ?? []).map((row) => mapUser(row));
}

export async function listShops(): Promise<ShopSummary[]> {
  const { data, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data ?? []).map((row) => mapShopSummary(row));
}

export async function updateSubscription(input: SubscriptionUpdateInput) {
  const updateQuery = await supabase
    .from("subscriptions")
    .update({
      status: input.status
    })
    .eq("shop_id", input.shopId)
    .select(
      `
      id,
      shop_id,
      status,
      current_period_ends_at,
      created_at
    `
    )
    .single();

  if (updateQuery.error || !updateQuery.data) {
    throw new AppError(updateQuery.error?.message ?? "Unable to update subscription", 500);
  }

  return updateQuery.data;
}
