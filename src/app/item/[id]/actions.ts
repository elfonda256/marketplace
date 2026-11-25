"use server";

import { redirect } from "next/navigation";
import { getImageUrl, fetchListing } from "@/lib/listings";
import { platformFeeCents, purchaseState, toCents } from "@/lib/payments";
import { getStripe } from "@/lib/server/clients";
import { getOrigin } from "@/lib/server/request";
import { getSeller } from "@/lib/server/sellers";

export type BuyState = { error: string } | null;

/**
 * Creates a Stripe Checkout Session as a direct charge: the payment is created on the
 * seller's connected account, and application_fee_amount moves the platform fee to us.
 * Everything is re-checked on the server; the button being visible proves nothing.
 */
export async function buyNow(listingId: string): Promise<BuyState> {
  let checkoutUrl: string;
  try {
    const listing = await fetchListing(listingId);
    if (!listing) return { error: "This listing no longer exists." };

    const seller = await getSeller(listing.seller_email);
    const state = purchaseState({
      status: listing.status,
      price: listing.price,
      sellerChargesEnabled: seller?.charges_enabled ?? false,
    });
    if (state !== "buyable" || !seller) return { error: "This item can't be bought online right now." };

    const amount = toCents(listing.price);
    const origin = await getOrigin();
    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: { name: listing.title, images: [getImageUrl(listing.image_path)] },
            },
          },
        ],
        payment_intent_data: { application_fee_amount: platformFeeCents(amount) },
        metadata: { listing_id: listing.id },
        success_url: `${origin}/orders/success?session_id={CHECKOUT_SESSION_ID}&account=${seller.stripe_account_id}`,
        cancel_url: `${origin}/item/${listing.id}`,
      },
      { stripeAccount: seller.stripe_account_id },
    );
    checkoutUrl = session.url!;
  } catch {
    return { error: "Could not start checkout. Please try again." };
  }

  redirect(checkoutUrl);
}
