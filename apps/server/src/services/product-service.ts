import QRCode from "qrcode";
import { z } from "zod";

import type { AuthUser, Product, ProductFormInput } from "@inventra/types";
import { mapProduct } from "../lib/mappers";

import { AppError } from "../lib/errors";
import { supabase } from "../lib/supabase";

const createProductSchema = z.object({
  shopId: z.string().uuid().optional(),
  product: z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number()
  })
});

function resolveShopScope(actor: AuthUser, requestedShopId?: string) {
  if (actor.role === "SUPER_ADMIN") {
    if (!requestedShopId) {
      throw new AppError("shopId is required for super admin product actions", 400);
    }

    return requestedShopId;
  }

  if (!actor.shopId) {
    throw new AppError("Shop is not attached to this account", 403);
  }

  return actor.shopId;
}

async function fetchProductOrThrow(id: string) {
  const productQuery = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (productQuery.error) {
    throw new AppError(productQuery.error.message, 500);
  }

  if (!productQuery.data) {
    throw new AppError("Product not found", 404);
  }

  return mapProduct(productQuery.data);
}

function assertProductAccess(actor: AuthUser, product: Product) {
  if (actor.role === "SUPER_ADMIN") {
    return;
  }

  if (!actor.shopId || actor.shopId !== product.shopId) {
    throw new AppError("You do not have access to this product", 403);
  }
}

export async function listProducts(actor: AuthUser, requestedShopId?: string) {
  const shopId = actor.role === "SUPER_ADMIN" ? requestedShopId : actor.shopId;

  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (shopId) {
    query = query.eq("shop_id", shopId);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data ?? []).map((row) => mapProduct(row));
}

export async function getProductById(actor: AuthUser, id: string) {
  const product = await fetchProductOrThrow(id);
  assertProductAccess(actor, product);
  return product;
}

export async function createProduct(actor: AuthUser, input: ProductFormInput, requestedShopId?: string) {
  createProductSchema.parse({
    shopId: requestedShopId,
    product: input
  });

  const shopId = resolveShopScope(actor, requestedShopId);

  const insertQuery = await supabase
    .from("products")
    .insert({
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      qr_code: "pending",
      shop_id: shopId
    })
    .select("*")
    .single();

  if (insertQuery.error || !insertQuery.data) {
    throw new AppError(insertQuery.error?.message ?? "Unable to create product", 500);
  }

  const qrCode = await QRCode.toDataURL(
    JSON.stringify({
      productId: insertQuery.data.id
    }),
    {
      margin: 1,
      width: 320
    }
  );

  const updateQuery = await supabase
    .from("products")
    .update({
      qr_code: qrCode
    })
    .eq("id", insertQuery.data.id)
    .select("*")
    .single();

  if (updateQuery.error || !updateQuery.data) {
    throw new AppError(updateQuery.error?.message ?? "Unable to attach QR code", 500);
  }

  return mapProduct(updateQuery.data);
}

export async function updateProduct(actor: AuthUser, id: string, input: ProductFormInput) {
  const product = await fetchProductOrThrow(id);
  assertProductAccess(actor, product);

  const updateQuery = await supabase
    .from("products")
    .update({
      name: input.name,
      price: input.price,
      quantity: input.quantity
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateQuery.error || !updateQuery.data) {
    throw new AppError(updateQuery.error?.message ?? "Unable to update product", 500);
  }

  return mapProduct(updateQuery.data);
}

export async function deleteProduct(actor: AuthUser, id: string) {
  const product = await fetchProductOrThrow(id);
  assertProductAccess(actor, product);

  const deleteQuery = await supabase.from("products").delete().eq("id", id);

  if (deleteQuery.error) {
    throw new AppError(deleteQuery.error.message, 500);
  }

  return {
    id
  };
}
