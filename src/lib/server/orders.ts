import "server-only";
import type Stripe from "stripe";
import { isUuid } from "../browse";
import { platformFeeCents } from "../payments";
import { getAdminDb } from "./clients";
import { getSeller } from "./sellers";

/**
 * Saves a paid Checkout Session as an order and marks its listing as sold.
 *
 * Both the webhook and the success page call this, so it must be idempotent: the
 * unique session id means a second call inserts nothing. The Stripe sandbox is shared
 * with other apps, so sessions for listings or accounts we don't know are ignored.
 * Returns the listing id when the order belongs to this marketplace.
 */
export async function recordPaidOrder(session: Stripe.Checkout.Session, accountId: string) {
  const listingId = session.metadata?.listing_id;
  if (session.payment_status !== "paid" || !listingId || !isUuid(listingId) || !session.amount_total) {
    return null;
  }

  const db = getAdminDb();
  const { data: listing, error: listingError } = await db
    .from("listings")
    .select("id, seller_email")
    .eq("id", listingId)
    .maybeSingle();
  if (listingError) throw listingError;
  if (!listing) return null;

  const seller = await getSeller(listing.seller_email);
  if (seller?.stripe_account_id !== accountId) return null;

  const { error: orderError } = await db.from("orders").upsert(
    {
      listing_id: listing.id,
      stripe_checkout_session_id: session.id,
      stripe_account_id: accountId,
      amount_total: session.amount_total,
      application_fee: platformFeeCents(session.amount_total),
      currency: session.currency ?? "usd",
      buyer_email: session.customer_details?.email ?? null,
    },
    { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true },
  );
  if (orderError) throw orderError;

  const { error: soldError } = await db
    .from("listings")
    .update({ status: "sold", sold_at: new Date().toISOString() })
    .eq("id", listing.id)
    .eq("status", "available");
  if (soldError) throw soldError;

  return listing.id as string;
}
