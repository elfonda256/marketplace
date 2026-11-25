import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { fetchListing } from "@/lib/listings";
import { formatCents, platformFeeCents, sellerPayoutCents } from "@/lib/payments";
import { getStripe } from "@/lib/server/clients";
import { recordPaidOrder } from "@/lib/server/orders";

export const metadata: Metadata = { title: "Order confirmed" };

type Params = Record<string, string | string[] | undefined>;

function NotFound() {
  return (
    <p className="text-sm text-muted">
      We couldn&apos;t find this order.{" "}
      <Link href="/" className="font-semibold text-brand hover:underline">
        Back to Marketplace
      </Link>
    </p>
  );
}

async function OrderSummary({ searchParams }: { searchParams: Promise<Params> }) {
  const { session_id: sessionId, account } = await searchParams;
  if (typeof sessionId !== "string" || typeof account !== "string" || !account.startsWith("acct_")) {
    return <NotFound />;
  }

  const session = await getStripe()
    .checkout.sessions.retrieve(sessionId, {}, { stripeAccount: account })
    .catch(() => null);
  if (!session) return <NotFound />;

  if (session.payment_status !== "paid") {
    return <p className="text-sm text-ink">Your payment hasn&apos;t completed yet. Refresh this page in a moment.</p>;
  }

  // The webhook records the order too; recording here as well means the buyer never
  // sees a success page for an order that isn't saved yet. Both calls are idempotent.
  const listingId = await recordPaidOrder(session, account);
  const listing = listingId ? await fetchListing(listingId) : null;
  if (!listing || !session.amount_total) return <NotFound />;

  const total = session.amount_total;
  const currency = session.currency ?? "usd";

  return (
    <div className="flex flex-col gap-4">
      <div role="status" className="rounded-lg bg-success-soft p-4 text-success">
        <p className="text-lg font-bold">Payment successful</p>
        <p className="text-sm">
          You bought <strong>{listing.title}</strong>.
          {session.customer_details?.email && <> A receipt goes to {session.customer_details.email}.</>}
        </p>
      </div>

      <dl className="grid grid-cols-[1fr_auto] gap-y-2 rounded-lg border border-line p-4 text-sm">
        <dt className="text-muted">You paid</dt>
        <dd className="text-right font-semibold text-ink">{formatCents(total, currency)}</dd>
        <dt className="text-muted">Seller receives</dt>
        <dd className="text-right text-ink">{formatCents(sellerPayoutCents(total), currency)}</dd>
        <dt className="text-muted">Marketplace fee</dt>
        <dd className="text-right text-ink">{formatCents(platformFeeCents(total), currency)}</dd>
      </dl>

      <p className="text-sm text-muted">
        Contact the seller at{" "}
        <a href={`mailto:${listing.seller_email}`} className="text-brand hover:underline">
          {listing.seller_email}
        </a>{" "}
        to arrange pickup.
      </p>

      <div className="flex gap-4 text-sm font-semibold">
        <Link href={`/item/${listing.id}`} className="text-brand hover:underline">
          View listing
        </Link>
        <Link href="/" className="text-brand hover:underline">
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage(props: PageProps<"/orders/success">) {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold text-ink">Order confirmed</h1>
      <Suspense fallback={<p className="text-sm text-muted">Confirming your payment...</p>}>
        <OrderSummary searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
