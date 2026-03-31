"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Product } from "@inventra/types";

let supabaseClient: SupabaseClient | null = null;

export interface ProductRow {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
  qr_code: string;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

export function getSupabaseBrowserClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase browser env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  return supabaseClient;
}

export function mapRealtimeProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    quantity: Number(row.quantity),
    qrCode: row.qr_code,
    shopId: row.shop_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
