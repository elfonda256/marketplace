import { isCategory, type CategorySlug } from "./categories";

export const LIMITS = {
  titleMin: 3,
  titleMax: 100,
  descriptionMax: 2000,
  priceMax: 1_000_000,
  locationMax: 100,
  messageMax: 1000,
  emailMax: 254,
} as const;

export const DEFAULT_LOCATION = "Palo Alto, CA";

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Same rule as the database check: something@something.something, no spaces. */
export function isValidEmail(email: string): boolean {
  return email.length <= LIMITS.emailMax && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/** Accepts "25", "25.5" or "1,299.99"; at most two decimals. */
export function parsePrice(input: string): number | null {
  const normalized = input.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const price = Number(normalized);
  return price <= LIMITS.priceMax ? price : null;
}

export type ListingForm = {
  title: string;
  description: string;
  price: string;
  category: string;
  sellerEmail: string;
  location: string;
};

export type ListingInput = {
  title: string;
  description: string;
  price: number;
  category: CategorySlug;
  sellerEmail: string;
  location: string;
};

export function validateListing(form: ListingForm): Result<ListingInput> {
  const title = form.title.trim();
  const description = form.description.trim();
  const sellerEmail = form.sellerEmail.trim().toLowerCase();
  const location = form.location.trim() || DEFAULT_LOCATION;
  const price = parsePrice(form.price);

  if (title.length < LIMITS.titleMin || title.length > LIMITS.titleMax) {
    return { ok: false, error: `Title must be ${LIMITS.titleMin}–${LIMITS.titleMax} characters.` };
  }
  if (price === null) {
    return { ok: false, error: "Enter a price like 25 or 25.50 (0 for free)." };
  }
  if (!isCategory(form.category)) {
    return { ok: false, error: "Choose a category." };
  }
  if (!isValidEmail(sellerEmail)) {
    return { ok: false, error: "Enter a valid email so buyers can reach you." };
  }
  if (description.length > LIMITS.descriptionMax) {
    return { ok: false, error: `Description can be at most ${LIMITS.descriptionMax} characters.` };
  }
  if (location.length > LIMITS.locationMax) {
    return { ok: false, error: `Location can be at most ${LIMITS.locationMax} characters.` };
  }
  return {
    ok: true,
    value: { title, description, price, category: form.category, sellerEmail, location },
  };
}

export type MessageInput = { buyerEmail: string; message: string };

export function validateMessage(form: MessageInput): Result<MessageInput> {
  const buyerEmail = form.buyerEmail.trim().toLowerCase();
  const message = form.message.trim();

  if (!isValidEmail(buyerEmail)) {
    return { ok: false, error: "Enter a valid email so the seller can reply." };
  }
  if (message.length === 0 || message.length > LIMITS.messageMax) {
    return { ok: false, error: `Write a message of 1–${LIMITS.messageMax} characters.` };
  }
  return { ok: true, value: { buyerEmail, message } };
}
