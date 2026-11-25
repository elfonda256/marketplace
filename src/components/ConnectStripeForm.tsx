"use client";

import { useActionState } from "react";
import { connectWithStripe } from "@/app/sell/actions";

export function ConnectStripeForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, action, isPending] = useActionState(connectWithStripe, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="seller-email" className="text-sm font-medium text-ink">
          Email on your listings
        </label>
        <input
          id="seller-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          className="rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-brand"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p role="status" className="rounded-lg bg-success-soft p-3 text-sm text-success">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-stripe px-4 py-2.5 font-semibold text-white hover:brightness-110 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stripe"
      >
        {isPending ? "Opening Stripe..." : "Connect with Stripe"}
      </button>
    </form>
  );
}
