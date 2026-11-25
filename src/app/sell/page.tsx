import type { Metadata } from "next";
import { ConnectStripeForm } from "@/components/ConnectStripeForm";
import { PLATFORM_FEE_RATE } from "@/lib/payments";

export const metadata: Metadata = { title: "Get paid" };

export default function SellPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-ink">Get paid for your listings</h1>
      <p className="mt-2 text-sm text-muted">
        Connect a Stripe account to the email you used on your listings. Once Stripe finishes setting it up,
        those listings show a <strong className="text-ink">Buy Now</strong> button and payments go straight to
        you. The marketplace keeps a {PLATFORM_FEE_RATE * 100}% fee.
      </p>
      <div className="mt-6 rounded-lg border border-line p-4">
        <ConnectStripeForm />
      </div>
      <p className="mt-3 text-xs text-muted">
        This site runs in Stripe test mode. Use Stripe&apos;s test data during onboarding; no real money moves.
      </p>
    </div>
  );
}
