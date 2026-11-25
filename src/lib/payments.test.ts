import { describe, expect, it } from "vitest";
import { formatCents, platformFeeCents, purchaseState, sellerPayoutCents, toCents } from "./payments";

describe("toCents", () => {
  it("converts dollars to whole cents without float drift", () => {
    expect(toCents(350)).toBe(35000);
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0.29)).toBe(29);
  });
});

describe("platform fee", () => {
  it("takes 10% and pays the rest to the seller", () => {
    expect(platformFeeCents(35000)).toBe(3500);
    expect(sellerPayoutCents(35000)).toBe(31500);
  });

  it("rounds to whole cents and never loses a cent", () => {
    expect(platformFeeCents(1999)).toBe(200);
    expect(platformFeeCents(1999) + sellerPayoutCents(1999)).toBe(1999);
  });
});

describe("formatCents", () => {
  it("formats cents as dollars", () => {
    expect(formatCents(31500)).toBe("$315.00");
  });
});

describe("purchaseState", () => {
  const base = { status: "available" as const, price: 60, sellerChargesEnabled: true };

  it("is buyable when the seller can accept payments", () => {
    expect(purchaseState(base)).toBe("buyable");
  });

  it("is sold once an order exists, even if everything else is fine", () => {
    expect(purchaseState({ ...base, status: "sold" })).toBe("sold");
  });

  it("treats free items and prices under Stripe's minimum as free", () => {
    expect(purchaseState({ ...base, price: 0 })).toBe("free");
    expect(purchaseState({ ...base, price: 0.49 })).toBe("free");
  });

  it("is not buyable until the seller finishes Stripe onboarding", () => {
    expect(purchaseState({ ...base, sellerChargesEnabled: false })).toBe("seller-not-connected");
  });
});
