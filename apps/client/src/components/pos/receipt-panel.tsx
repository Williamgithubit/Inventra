"use client";

import type { Sale } from "@inventra/types";
import { Button, Card } from "@inventra/ui";
import { buildReceiptNumber, formatCurrency, formatDateTime } from "@inventra/utils";

export function ReceiptPanel({ sale }: { sale: Sale | null }) {
  if (!sale) {
    return null;
  }

  return (
    <Card className="space-y-5 print:shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Receipt</p>
          <h2 className="mt-2 font-display text-3xl text-ink">{buildReceiptNumber(sale.id)}</h2>
          <p className="mt-1 text-sm text-stone-500">{formatDateTime(sale.createdAt)}</p>
        </div>
        <Button variant="ghost" onClick={() => window.print()}>
          Print Receipt
        </Button>
      </div>

      <div className="space-y-3">
        {sale.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
            <div>
              <p className="font-semibold text-ink">{item.product?.name ?? "Product"}</p>
              <p className="text-sm text-stone-500">
                {item.quantity} x {formatCurrency(item.price)}
              </p>
            </div>
            <p className="font-semibold text-ink">{formatCurrency(item.quantity * item.price)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-stone-300 pt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Total</p>
        <p className="font-display text-3xl text-ink">{formatCurrency(sale.totalAmount)}</p>
      </div>
    </Card>
  );
}
