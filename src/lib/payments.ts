/** The marketplace keeps 10% of every sale as its application fee. */
export const PLATFORM_FEE_RATE = 0.1;

/** Stripe's smallest charge in USD is $0.50. */
export const MIN_CHARGE_CENTS = 50;

/** Prices are stored in dollars with two decimals; Stripe works in cents. */
export function toCents(price: number): number {
  return Math.round(price * 100);
}

export function platformFeeCents(amountCents: number): number {
  return Math.round(amountCents * PLATFORM_FEE_RATE);
}

export function sellerPayoutCents(amountCents: number): number {
  return amountCents - platformFeeCents(amountCents);
}

export function formatCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );
}

export type PurchaseState = "buyable" | "sold" | "free" | "seller-not-connected";

type PurchaseInput = {
  status: "available" | "sold";
  price: number;
  sellerChargesEnabled: boolean;
};

/** Decides whether a listing shows Buy Now, and if not, why. */
export function purchaseState({ status, price, sellerChargesEnabled }: PurchaseInput): PurchaseState {
  if (status === "sold") return "sold";
  if (toCents(price) < MIN_CHARGE_CENTS) return "free";
  if (!sellerChargesEnabled) return "seller-not-connected";
  return "buyable";
}
