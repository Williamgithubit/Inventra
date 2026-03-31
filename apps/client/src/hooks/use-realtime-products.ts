"use client";

import { useEffect } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { toast } from "sonner";

import type { ProductRow } from "../lib/supabase";
import { useAppDispatch, useAppSelector } from "./use-app-store";
import { getSupabaseBrowserClient, mapRealtimeProduct } from "../lib/supabase";
import { syncInventory } from "../store/slices/cart-slice";
import { removeProduct, upsertProduct } from "../store/slices/inventory-slice";

export function useRealtimeProducts(shopId: string | null, enabled: boolean) {
  const dispatch = useAppDispatch();
  const lowStockThreshold = useAppSelector((state) => state.inventory.lowStockThreshold);

  useEffect(() => {
    if (!enabled || !shopId) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const handleProductChange = (payload: RealtimePostgresChangesPayload<ProductRow>) => {
      if (payload.eventType === "DELETE") {
        const deletedId = payload.old.id;

        if (deletedId) {
          dispatch(removeProduct(String(deletedId)));
        }

        return;
      }

      const product = mapRealtimeProduct(payload.new);

      dispatch(upsertProduct(product));
      dispatch(syncInventory([product]));

      if (payload.eventType !== "UPDATE") {
        return;
      }

      const previousQuantity = Number(payload.old.quantity ?? Number.NaN);
      const droppedIntoLowStock =
        Number.isFinite(previousQuantity) &&
        previousQuantity > lowStockThreshold &&
        product.quantity <= lowStockThreshold;

      if (droppedIntoLowStock) {
        toast.warning("Low stock alert", {
          id: `low-stock:${product.id}:${product.quantity}`,
          description: `${product.name} now has ${product.quantity} units left.`
        });
      }
    };

    const channel = supabase.channel(`inventra-products-${shopId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
        filter: `shop_id=eq.${shopId}`
      },
      handleProductChange
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [dispatch, enabled, lowStockThreshold, shopId]);
}
