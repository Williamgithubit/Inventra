import type { AuthUser, CheckoutInput, Sale } from "@inventra/types";
import { mapSale } from "../lib/mappers";

import { AppError } from "../lib/errors";
import { supabase } from "../lib/supabase";

const saleGraph = `
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
`;

function resolveSaleShopId(actor: AuthUser) {
  if (actor.role === "SUPER_ADMIN") {
    throw new AppError("Sales must be created within a shop owner scope", 400);
  }

  if (!actor.shopId) {
    throw new AppError("Shop is not attached to this account", 403);
  }

  return actor.shopId;
}

export async function createSale(actor: AuthUser, input: CheckoutInput) {
  const shopId = resolveSaleShopId(actor);

  const rpcQuery = await supabase.rpc("checkout_sale", {
    p_shop_id: shopId,
    p_items: input.items
  });

  if (rpcQuery.error || !rpcQuery.data) {
    throw new AppError(rpcQuery.error?.message ?? "Unable to create sale", 400);
  }

  const saleId = String(rpcQuery.data);

  const saleQuery = await supabase.from("sales").select(saleGraph).eq("id", saleId).single();

  if (saleQuery.error || !saleQuery.data) {
    throw new AppError(saleQuery.error?.message ?? "Unable to load created sale", 500);
  }

  return mapSale(saleQuery.data);
}

export async function listSales(actor: AuthUser): Promise<Sale[]> {
  const shopId = actor.role === "SUPER_ADMIN" ? undefined : actor.shopId;

  let query = supabase.from("sales").select(saleGraph).order("created_at", { ascending: false });

  if (shopId) {
    query = query.eq("shop_id", shopId);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data ?? []).map((row) => mapSale(row));
}

export async function getSaleById(actor: AuthUser, saleId: string): Promise<Sale> {
  const saleQuery = await supabase.from("sales").select(saleGraph).eq("id", saleId).maybeSingle();

  if (saleQuery.error) {
    throw new AppError(saleQuery.error.message, 500);
  }

  if (!saleQuery.data) {
    throw new AppError("Sale not found", 404);
  }

  if (actor.role !== "SUPER_ADMIN" && saleQuery.data.shop_id !== actor.shopId) {
    throw new AppError("You do not have access to this sale", 403);
  }

  return mapSale(saleQuery.data);
}
