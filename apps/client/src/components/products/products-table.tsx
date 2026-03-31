"use client";

import Image from "next/image";
import Link from "next/link";

import type { Product } from "@inventra/types";
import { Badge, Button, Card, EmptyState } from "@inventra/ui";
import { cn, formatCurrency, isLowStock } from "@inventra/utils";
import { useAppSelector } from "../../hooks/use-app-store";

export function ProductsTable({
  products,
  onDelete
}: {
  products: Product[];
  onDelete: (productId: string) => Promise<void>;
}) {
  const lowStockThreshold = useAppSelector((state) => state.inventory.lowStockThreshold);

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Add your first item and Inventra will generate a QR code ready for labeling."
        action={
          <Link href="/products/new" className="inline-flex rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
            Add Product
          </Link>
        }
      />
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-left">
          <thead className="bg-stone-50">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">QR</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {products.map((product) => (
              <tr
                key={product.id}
                className={cn(isLowStock(product.quantity, lowStockThreshold) ? "bg-amber-50/70" : "")}
              >
                <td className="px-6 py-5">
                  <div>
                    <p className="font-semibold text-ink">{product.name}</p>
                    <p className="mt-1 text-xs text-stone-500">{product.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-stone-600">{formatCurrency(product.price)}</td>
                <td className="px-6 py-5">
                  <Badge tone={isLowStock(product.quantity, lowStockThreshold) ? "warning" : "success"}>
                    {product.quantity} units
                  </Badge>
                </td>
                <td className="px-6 py-5">
                  <div className="inline-flex rounded-2xl border border-stone-200 bg-stone-50 p-2">
                    <Image alt={`${product.name} QR code`} height={72} src={product.qrCode} unoptimized width={72} />
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="inline-flex rounded-2xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
                    >
                      Edit
                    </Link>
                    <a
                      className="inline-flex rounded-2xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
                      download={`${product.name}-qr.png`}
                      href={product.qrCode}
                    >
                      Print QR
                    </a>
                    <Button variant="danger" onClick={() => onDelete(product.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
