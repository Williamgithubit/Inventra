import type { Product, Sale, SaleItem, ShopSummary, Subscription, User } from "@inventra/types";

export function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: row.role as User["role"],
    createdAt: String(row.created_at)
  };
}

export function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price),
    quantity: Number(row.quantity),
    qrCode: String(row.qr_code),
    shopId: String(row.shop_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export function mapSaleItem(row: Record<string, unknown>): SaleItem {
  const productRow = row.product as Record<string, unknown> | undefined;

  return {
    id: String(row.id),
    saleId: String(row.sale_id),
    productId: String(row.product_id),
    quantity: Number(row.quantity),
    price: Number(row.price),
    product: productRow ? mapProduct(productRow) : undefined
  };
}

export function mapSale(row: Record<string, unknown>): Sale {
  const items = Array.isArray(row.items)
    ? row.items.map((item) => mapSaleItem(item as Record<string, unknown>))
    : [];

  return {
    id: String(row.id),
    shopId: String(row.shop_id),
    totalAmount: Number(row.total_amount),
    createdAt: String(row.created_at),
    items
  };
}

export function mapSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: String(row.id),
    shopId: String(row.shop_id),
    status: row.status as Subscription["status"],
    currentPeriodEndsAt: row.current_period_ends_at ? String(row.current_period_ends_at) : null,
    createdAt: String(row.created_at)
  };
}

export function mapShopSummary(row: Record<string, unknown>): ShopSummary {
  const ownerRow = row.owner as Record<string, unknown> | undefined;
  const subscriptionRow = row.subscription as Record<string, unknown> | undefined;

  return {
    id: String(row.id),
    name: String(row.name),
    ownerId: String(row.owner_id),
    createdAt: String(row.created_at),
    owner: ownerRow
      ? {
          id: String(ownerRow.id),
          name: String(ownerRow.name),
          email: String(ownerRow.email)
        }
      : undefined,
    subscription: subscriptionRow ? mapSubscription(subscriptionRow) : undefined
  };
}
