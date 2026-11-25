import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConnectStripeForm } from "@/components/ConnectStripeForm";
import { supabase } from "@/lib/supabase";
import { getSeller, refreshSeller } from "@/lib/server/sellers";

export const metadata: Metadata = { title: "Stripe setup" };

async function SellerStatus({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { email } = await searchParams;
  const found = typeof email === "string" ? await getSeller(email) : null;

  if (!found) {
    return (
      <p className="text-sm text-muted">
        We couldn&apos;t find that seller.{" "}
        <Link href="/sell" className="font-semibold text-brand hover:underline">
          Start again
        </Link>
        .
      </p>
    );
  }

  // Ask Stripe directly instead of waiting for the account.updated webhook.
  const seller = await refreshSeller(found);

  if (!seller.charges_enabled) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink">
          Stripe still needs a few details before <strong>{seller.email}</strong> can accept payments. Continue
          where you left off:
        </p>
        <ConnectStripeForm defaultEmail={seller.email} />
      </div>
    );
  }

  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_email", seller.email)
    .eq("status", "available");

  return (
    <div role="status" className="rounded-lg bg-success-soft p-4 text-sm text-success">
      <p className="font-semibold">You&apos;re ready to get paid.</p>
      <p className="mt-1">
        {seller.email} is connected to Stripe. {count ?? 0} of your listings now show a Buy Now button.
      </p>
      <Link href="/" className="mt-3 inline-block font-semibold text-brand hover:underline">
        Back to Marketplace
      </Link>
    </div>
  );
}

export default function SellReturnPage(props: PageProps<"/sell/return">) {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold text-ink">Stripe setup</h1>
      <Suspense fallback={<p className="text-sm text-muted">Checking your Stripe account...</p>}>
        <SellerStatus searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
