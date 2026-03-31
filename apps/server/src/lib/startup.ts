import { env } from "../env";
import { supabase } from "./supabase";

export function printStartupBanner() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║                     INVENTRA API                         ║");
  console.log("║            Smart Inventory & POS Platform                ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log("");
}

export async function verifyDatabaseConnection() {
  console.log("Testing database connection...");

  const { error } = await supabase.from("users").select("id").limit(1);

  if (error) {
    throw new Error(`Supabase connection check failed: ${error.message}`);
  }

  console.log("Database connection established successfully");
  console.log("Database connected and ready");
}

export function inspectRealtimeConfiguration() {
  console.log("[Realtime inspector] Initializing...");

  if (!env.SUPABASE_JWT_SECRET) {
    console.log("[Realtime inspector] Missing SUPABASE_JWT_SECRET. Realtime auth will stay disabled until it is configured.");
    return {
      ready: false
    };
  }

  console.log("[Realtime inspector] Initialized successfully");

  return {
    ready: true
  };
}
