import "server-only";
import type Stripe from "stripe";
import { getAdminDb, getStripe } from "./clients";

export type Seller = {
  email: string;
  stripe_account_id: string;
  charges_enabled: boolean;
  details_submitted: boolean;
};

export async function getSeller(email: string): Promise<Seller | null> {
  const { data, error } = await getAdminDb()
    .from("sellers")
    .select("email, stripe_account_id, charges_enabled, details_submitted")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Returns the seller's connected account, creating one on first use. The settings match
 * Stripe's recommendation for direct charges: the seller has the full Stripe Dashboard,
 * pays Stripe's fees, and Stripe covers negative balances.
 */
export async function getOrCreateSeller(email: string): Promise<Seller> {
  const existing = await getSeller(email);
  if (existing) return existing;

  const account = await getStripe().accounts.create({
    email,
    controller: {
      fees: { payer: "account" },
      losses: { payments: "stripe" },
      stripe_dashboard: { type: "full" },
    },
    capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
  });

  // ignoreDuplicates: if two requests race, the first saved account wins.
  const { error } = await getAdminDb()
    .from("sellers")
    .upsert({ email, stripe_account_id: account.id }, { onConflict: "email", ignoreDuplicates: true });
  if (error) throw error;

  return (await getSeller(email))!;
}

export async function createOnboardingLink(seller: Seller, origin: string): Promise<string> {
  const email = encodeURIComponent(seller.email);
  const link = await getStripe().accountLinks.create({
    account: seller.stripe_account_id,
    type: "account_onboarding",
    refresh_url: `${origin}/sell/refresh?email=${email}`,
    return_url: `${origin}/sell/return?email=${email}`,
  });
  return link.url;
}

/** Copies the account's payment status into Supabase. Unknown accounts are ignored. */
export async function syncSellerAccount(account: Stripe.Account): Promise<Seller | null> {
  const { data, error } = await getAdminDb()
    .from("sellers")
    .update({
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_account_id", account.id)
    .select("email, stripe_account_id, charges_enabled, details_submitted")
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Fetches the latest account state from Stripe and saves it. */
export async function refreshSeller(seller: Seller): Promise<Seller> {
  const account = await getStripe().accounts.retrieve(seller.stripe_account_id);
  return (await syncSellerAccount(account)) ?? seller;
}
