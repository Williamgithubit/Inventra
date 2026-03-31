"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../../hooks/use-auth";
import { useRealtimeProducts } from "../../hooks/use-realtime-products";
import { useRealtimeSales } from "../../hooks/use-realtime-sales";
import { useAppDispatch } from "../../hooks/use-app-store";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import {
  getApiErrorMessage,
  useLazyGetRealtimeTokenQuery,
  useLazyListProductsQuery,
  useLazyListSalesQuery
} from "../../store/api";
import { clearInventory, setLowStockThreshold } from "../../store/slices/inventory-slice";
import { clearSales } from "../../store/slices/sales-slice";

export function RealtimeBridge() {
  const { token, user } = useAuth();
  const dispatch = useAppDispatch();
  const [fetchProducts] = useLazyListProductsQuery();
  const [fetchSales] = useLazyListSalesQuery();
  const [fetchRealtimeToken] = useLazyGetRealtimeTokenQuery();
  const [shopId, setShopId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useRealtimeProducts(shopId, enabled);
  useRealtimeSales(shopId, token, enabled);

  useEffect(() => {
    if (!token || user?.role !== "SHOP_OWNER") {
      setEnabled(false);
      setShopId(null);
      dispatch(clearInventory());
      dispatch(clearSales());
      return;
    }

    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const bootstrapRealtime = async () => {
      await Promise.all([
        fetchProducts().unwrap(),
        fetchSales().unwrap()
      ]);

      const supabase = getSupabaseBrowserClient();
      const realtimeAuth = await fetchRealtimeToken().unwrap();

      await supabase.realtime.setAuth(realtimeAuth.token);
      dispatch(setLowStockThreshold(realtimeAuth.lowStockThreshold));

      setShopId(realtimeAuth.shopId);
      setEnabled(Boolean(realtimeAuth.shopId));

      return realtimeAuth.expiresAt;
    };

    const scheduleRefresh = async () => {
      try {
        const expiresAt = await bootstrapRealtime();

        if (cancelled || !expiresAt) {
          return;
        }

        const millisecondsUntilRefresh = Math.max(
          new Date(expiresAt).getTime() - Date.now() - 60_000,
          60_000
        );

        refreshTimer = setTimeout(() => {
          void scheduleRefresh();
        }, millisecondsUntilRefresh);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setEnabled(false);
        setShopId(null);
        toast.error(getApiErrorMessage(error, "Unable to initialize Supabase Realtime"), {
          id: "inventra-realtime-init"
        });

        refreshTimer = setTimeout(() => {
          void scheduleRefresh();
        }, 60_000);
      }
    };

    void scheduleRefresh();

    return () => {
      cancelled = true;

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [dispatch, fetchProducts, fetchRealtimeToken, fetchSales, token, user?.role]);

  return null;
}
