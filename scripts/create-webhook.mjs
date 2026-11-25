// Registers this app's webhook endpoint with Stripe. Run once:
//   node --env-file=.env.local scripts/create-webhook.mjs https://your-app.vercel.app
// Then save the printed signing secret as STRIPE_WEBHOOK_SECRET.
import Stripe from "stripe";

const siteUrl = process.argv[2];
if (!siteUrl) {
  console.error("Usage: node --env-file=.env.local scripts/create-webhook.mjs <production URL>");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpoint = await stripe.webhookEndpoints.create({
  url: new URL("/api/stripe/webhook", siteUrl).toString(),
  connect: true,
  enabled_events: ["checkout.session.completed", "account.updated"],
});
console.log("Webhook id:", endpoint.id);
console.log("Signing secret:", endpoint.secret);
