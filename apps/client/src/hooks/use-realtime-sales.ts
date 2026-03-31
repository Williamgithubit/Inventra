"use client";

import { useEffect } from "react";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { toast } from "sonner";

import { getSupabaseBrowserClient } from "../lib/supabase";
import { getApiErrorMessage, useLazyGetSaleQuery } from "../store/api";

interface SaleRow {
  id: string;
  shop_id: string;
}

export function useRealtimeSales(shopId: string | null, token: string | null, enabled: boolean) {
  const [fetchSale] = useLazyGetSaleQuery();

  useEffect(() => {
    if (!enabled || !shopId || !token) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const handleSaleInsert = async (payload: RealtimePostgresInsertPayload<SaleRow>) => {
      try {
        await fetchSale(payload.new.id).unwrap();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to hydrate the latest sale"));
      }
    };

    const channel = supabase.channel(`inventra-sales-${shopId}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "sales",
        filter: `shop_id=eq.${shopId}`
      },
      handleSaleInsert
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, fetchSale, shopId, token]);
}
