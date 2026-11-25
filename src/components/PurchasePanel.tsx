import { formatPrice } from "@/lib/browse";
import type { Listing } from "@/lib/listings";
import { PLATFORM_FEE_RATE, purchaseState } from "@/lib/payments";
import { getSeller } from "@/lib/server/sellers";
import { BuyNowButton } from "./BuyNowButton";

export async function PurchasePanel({ listing }: { listing: Listing }) {
  const seller = await getSeller(listing.seller_email);
  const state = purchaseState({
    status: listing.status,
    price: listing.price,
    sellerChargesEnabled: seller?.charges_enabled ?? false,
  });

  switch (state) {
    case "buyable":
      return (
        <div className="flex flex-col gap-1">
          <BuyNowButton listingId={listing.id} price={formatPrice(listing.price)} />
          <p className="text-xs text-muted">
            Secure checkout with Stripe (test mode). The seller is paid directly; the marketplace keeps{" "}
            {PLATFORM_FEE_RATE * 100}%.
          </p>
        </div>
      );
    case "sold":
      return <p className="rounded-lg bg-surface p-3 font-semibold text-ink">This item has been sold.</p>;
    case "seller-not-connected":
      return (
        <p className="text-sm text-muted">
          The seller hasn&apos;t set up online payments yet. Message them below to arrange the sale.
        </p>
      );
    case "free":
      return null;
  }
}
