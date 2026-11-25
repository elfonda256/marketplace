import type Stripe from "stripe";
import { getStripe } from "@/lib/server/clients";
import { handleStripeEvent } from "@/lib/server/events";

/**
 * Receives Connect events. Payments are direct charges on sellers' accounts, so the
 * events come from those accounts and event.account says which one. The sandbox is
 * shared with other apps: events we don't recognize are acknowledged and ignored.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // The signature covers the raw body, so read it as text before parsing.
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // A thrown error returns 500, so Stripe retries the event later.
  await handleStripeEvent(event, event.account);
  return Response.json({ received: true });
}
