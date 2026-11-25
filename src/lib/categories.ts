/** Keep in sync with the category check constraint in supabase/schema.sql. */
export const CATEGORIES = [
  { slug: "electronics", label: "Electronics" },
  { slug: "furniture", label: "Furniture" },
  { slug: "home-goods", label: "Home Goods" },
  { slug: "apparel", label: "Apparel" },
  { slug: "vehicles", label: "Vehicles" },
  { slug: "books", label: "Books" },
  { slug: "sporting-goods", label: "Sporting Goods" },
  { slug: "toys-games", label: "Toys & Games" },
  { slug: "free-stuff", label: "Free Stuff" },
  { slug: "other", label: "Other" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function isCategory(value: unknown): value is CategorySlug {
  return CATEGORIES.some((category) => category.slug === value);
}

export function categoryLabel(slug: CategorySlug): string {
  return CATEGORIES.find((category) => category.slug === slug)!.label;
}
