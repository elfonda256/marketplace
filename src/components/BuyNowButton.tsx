"use client";

import { useActionState } from "react";
import { buyNow } from "@/app/item/[id]/actions";

type BuyNowButtonProps = {
  listingId: string;
  price: string;
};

export function BuyNowButton({ listingId, price }: BuyNowButtonProps) {
  const [state, action, isPending] = useActionState(() => buyNow(listingId), null);

  return (
    <form action={action} className="flex flex-col gap-2">
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {isPending ? "Opening checkout..." : `Buy Now · ${price}`}
      </button>
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
