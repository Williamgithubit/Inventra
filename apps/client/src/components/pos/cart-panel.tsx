"use client";

import { Button, Card, EmptyState } from "@inventra/ui";
import { formatCurrency } from "@inventra/utils";

import { useAppDispatch, useAppSelector } from "../../hooks/use-app-store";
import { removeFromCart, updateQuantity } from "../../store/slices/cart-slice";

export function CartPanel({
  onCheckout,
  isSubmitting
}: {
  onCheckout: () => Promise<void>;
  isSubmitting: boolean;
}) {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Cart is empty"
        description="Scan a QR code or paste a product id to start a sale."
      />
    );
  }

  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Cart</p>
          <h2 className="mt-2 font-display text-3xl text-ink">{formatCurrency(total)}</h2>
        </div>
        <Button onClick={onCheckout} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Checkout"}
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="text-sm text-stone-500">{formatCurrency(item.price)} each</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  className="w-20 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
                  min={1}
                  max={item.availableQuantity}
                  onChange={(event) =>
                    dispatch(
                      updateQuantity({
                        productId: item.productId,
                        quantity: Number(event.target.value)
                      })
                    )
                  }
                  type="number"
                  value={item.quantity}
                />
                <Button variant="ghost" onClick={() => dispatch(removeFromCart(item.productId))}>
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
