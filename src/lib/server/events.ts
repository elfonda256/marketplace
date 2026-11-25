import "server-only";
import type Stripe from "stripe";
import { getAdminDb, getStripe } from "./clients";
import { recordPaidOrder } from "./orders";
import { syncSellerAccount } from "./sellers";

/**
 * The one place that acts on Stripe events. The webhook (push) and the scheduled
 * reconcile job (pull) both call it, and every action is idempotent, so seeing the
 * same event twice is harmless.
 */
export async function handleStripeEvent(event: Stripe.Event, accountId: string | undefined) {
  switch (event.type) {
    case "checkout.session.completed":
      if (accountId) await recordPaidOrder(event.data.object, accountId);
      break;
    case "account.updated":
      await syncSellerAccount(event.data.object);
      break;
  }
}

const RECONCILE_WINDOW_SECONDS = 2 * 60 * 60;

/**
 * Fallback for missed webhooks: lists recent events on every connected seller account
 * and handles them. Runs on a schedule, so a payment is recorded even if the buyer closed
 * the tab before the success page and the webhook never arrived.
 */
export async function reconcileRecentEvents(): Promise<number> {
  const { data: sellers, error } = await getAdminDb().from("sellers").select("stripe_account_id");
  if (error) throw error;

  const since = Math.floor(Date.now() / 1000) - RECONCILE_WINDOW_SECONDS;
  let handled = 0;

  for (const { stripe_account_id: accountId } of sellers) {
    const events = getStripe().events.list(
      { types: ["checkout.session.completed", "account.updated"], created: { gte: since }, limit: 100 },
      { stripeAccount: accountId },
    );
    for await (const event of events) {
      await handleStripeEvent(event, accountId);
      handled += 1;
    }
  }
  return handled;
}
