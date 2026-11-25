import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCATION,
  isValidEmail,
  parsePrice,
  validateListing,
  validateMessage,
  type ListingForm,
} from "./validation";

const validForm: ListingForm = {
  title: "  Road bike  ",
  description: "Barely used.",
  price: "250",
  category: "sporting-goods",
  sellerEmail: " Seller@Example.com ",
  location: "",
};

describe("parsePrice", () => {
  it("accepts whole numbers, two decimals and thousands separators", () => {
    expect(parsePrice("25")).toBe(25);
    expect(parsePrice("25.5")).toBe(25.5);
    expect(parsePrice("1,299.99")).toBe(1299.99);
    expect(parsePrice("0")).toBe(0);
  });

  it("rejects negatives, text, too many decimals and huge prices", () => {
    expect(parsePrice("-5")).toBeNull();
    expect(parsePrice("abc")).toBeNull();
    expect(parsePrice("1.999")).toBeNull();
    expect(parsePrice("1000001")).toBeNull();
    expect(parsePrice("")).toBeNull();
  });
});

describe("isValidEmail", () => {
  it("accepts a normal address and rejects malformed ones", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("no-at-sign.com")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a b@c.com")).toBe(false);
  });
});

describe("validateListing", () => {
  it("normalizes a valid form", () => {
    expect(validateListing(validForm)).toEqual({
      ok: true,
      value: {
        title: "Road bike",
        description: "Barely used.",
        price: 250,
        category: "sporting-goods",
        sellerEmail: "seller@example.com",
        location: DEFAULT_LOCATION,
      },
    });
  });

  it("rejects a short title", () => {
    expect(validateListing({ ...validForm, title: "ab" }).ok).toBe(false);
  });

  it("rejects an unknown category", () => {
    expect(validateListing({ ...validForm, category: "weapons" }).ok).toBe(false);
  });

  it("rejects an invalid price or email", () => {
    expect(validateListing({ ...validForm, price: "ten" }).ok).toBe(false);
    expect(validateListing({ ...validForm, sellerEmail: "nope" }).ok).toBe(false);
  });
});

describe("validateMessage", () => {
  it("trims and lowercases a valid message", () => {
    expect(validateMessage({ buyerEmail: " Buyer@Mail.com", message: " Is it available? " })).toEqual({
      ok: true,
      value: { buyerEmail: "buyer@mail.com", message: "Is it available?" },
    });
  });

  it("rejects an empty message or a bad email", () => {
    expect(validateMessage({ buyerEmail: "buyer@mail.com", message: "   " }).ok).toBe(false);
    expect(validateMessage({ buyerEmail: "buyer", message: "Hi" }).ok).toBe(false);
  });
});
