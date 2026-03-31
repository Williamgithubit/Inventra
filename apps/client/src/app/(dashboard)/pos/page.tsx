"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Sale } from "@inventra/types";
import { Badge, Card } from "@inventra/ui";
import { formatCurrency } from "@inventra/utils";

import { AuthGuard } from "../../../components/auth/auth-guard";
import { CartPanel } from "../../../components/pos/cart-panel";
import { ProductScanner } from "../../../components/pos/product-scanner";
import { ReceiptPanel } from "../../../components/pos/receipt-panel";
import { PageHeader } from "../../../components/shared/page-header";
import { LoadingScreen } from "../../../components/shared/loading-screen";
import { useAuth } from "../../../hooks/use-auth";
import { useAppDispatch, useAppSelector } from "../../../hooks/use-app-store";
import { getApiErrorMessage, useCreateSaleMutation, useScanProductMutation } from "../../../store/api";
import { addToCart, clearCart, syncInventory } from "../../../store/slices/cart-slice";
import { upsertProduct } from "../../../store/slices/inventory-slice";

export default function PosPage() {
  const { token } = useAuth();
  const dispatch = useAppDispatch();
  const [createSale] = useCreateSaleMutation();
  const [scanProduct] = useScanProductMutation();
  const cartItems = useAppSelector((state) => state.cart.items);
  const products = useAppSelector((state) => state.inventory.products);
  const lowStockThreshold = useAppSelector((state) => state.inventory.lowStockThreshold);
  const loading = useAppSelector((state) => Boolean(token) && !state.inventory.hasLoadedOnce);
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleDetected(productId: string) {
    if (!token) {
      return;
    }

    try {
      const product = await scanProduct(productId).unwrap();

      if (product.quantity <= 0) {
        toast.error(`${product.name} is out of stock`);
        return;
      }

      dispatch(addToCart(product));
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add product");
    }
  }

  async function handleCheckout() {
    if (!token || cartItems.length === 0) {
      return;
    }

    try {
      setSubmitting(true);
      const sale = await createSale({
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        }))
      }).unwrap();

      setReceipt(sale);

      const updatedProducts = sale.items
        .map((item) => item.product)
        .filter((product): product is NonNullable<typeof product> => Boolean(product));

      updatedProducts.forEach((product) => {
        dispatch(upsertProduct(product));
      });
      dispatch(syncInventory(updatedProducts));
      dispatch(clearCart());
      toast.success("Checkout complete");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to complete checkout"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGuard roles={["SHOP_OWNER"]}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Point of Sale"
          title="Scan fast. Sell faster."
          description="Add products by QR or barcode, adjust quantities, and close a sale with a clean receipt."
        />

        {loading && products.length === 0 ? <LoadingScreen /> : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <ProductScanner onDetected={handleDetected} />

            <Card className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Quick Add</p>
                <h2 className="mt-2 font-display text-3xl text-ink">Tap bestsellers into the cart</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {products.slice(0, 8).map((product) => (
                  <button
                    key={product.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left transition hover:border-brand-400 hover:bg-white"
                    onClick={async () => {
                      await handleDetected(product.id);
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-ink">{product.name}</p>
                        <p className="mt-1 text-sm text-stone-500">{formatCurrency(product.price)}</p>
                      </div>
                      <Badge tone={product.quantity <= lowStockThreshold ? "warning" : "success"}>
                        {product.quantity}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <CartPanel isSubmitting={submitting} onCheckout={handleCheckout} />
            <ReceiptPanel sale={receipt} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
