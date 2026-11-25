import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}.`);
  return value;
}

let stripe: Stripe | undefined;
let admin: SupabaseClient | undefined;

/** Stripe client with the platform's secret key. Created on first use so builds don't need the key. */
export function getStripe(): Stripe {
  stripe ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  return stripe;
}

/**
 * Supabase client with the secret key. It bypasses row level security, so it only
 * ever runs on the server ("server-only" makes importing it from the browser a build error).
 */
export function getAdminDb(): SupabaseClient {
  admin ??= createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("DB_SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return admin;
}
