import { isCategory, type CategorySlug } from "./categories";

export type BrowseFilters = {
  category: CategorySlug | null;
  query: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Reads ?category= and ?q= from the URL, ignoring anything invalid. */
export function parseBrowseFilters(params: SearchParams): BrowseFilters {
  const category = first(params.category);
  return {
    category: isCategory(category) ? category : null,
    query: first(params.q).trim().slice(0, 100),
  };
}

export function buildBrowseHref({ category, query }: BrowseFilters): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

/**
 * Turns user input into a safe ilike pattern. Characters with a meaning in
 * PostgREST filters (, ( ) and LIKE wildcards) are dropped, so a search for
 * "50% off" can't change the query.
 */
export function toSearchPattern(query: string): string | null {
  const cleaned = query.replace(/[,()%_\\*]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned ? `%${cleaned}%` : null;
}

export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
  }).format(price);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
