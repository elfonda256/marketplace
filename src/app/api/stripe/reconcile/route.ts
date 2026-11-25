import { handleSchedule } from "@vercel/schedules";
import { reconcileRecentEvents } from "@/lib/server/events";

/**
 * Private scheduled function (see vercel.json): only Vercel's scheduler can invoke it.
 * Pulls recent Stripe events as a fallback for webhooks that never arrived.
 */
export const POST = handleSchedule(async (metadata) => {
  const handled = await reconcileRecentEvents();
  console.log(`${metadata.name} ${metadata.executionId}: handled ${handled} Stripe events`);
});
