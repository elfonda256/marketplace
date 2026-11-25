import Link from "next/link";
import { parseBrowseFilters } from "@/lib/browse";
import { categoryLabel } from "@/lib/categories";
import { fetchListings } from "@/lib/listings";
import { BrowseSidebar } from "./BrowseSidebar";
import { ListingCard } from "./ListingCard";

type BrowseListingsProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function BrowseListings({ searchParams }: BrowseListingsProps) {
  const filters = parseBrowseFilters(await searchParams);
  const listings = await fetchListings(filters);

  const heading = filters.query
    ? `Results for “${filters.query}”`
    : filters.category
      ? categoryLabel(filters.category)
      : "Today's picks";

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <BrowseSidebar filters={filters} />

      <section aria-labelledby="results-heading" className="min-w-0 flex-1">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h1 id="results-heading" className="text-xl font-bold text-ink">
            {heading}
          </h1>
          <p className="text-sm text-muted">
            {listings.length} {listings.length === 1 ? "listing" : "listings"}
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-lg bg-surface p-8 text-center">
            <p className="font-semibold text-ink">No listings found.</p>
            <p className="mt-1 text-sm text-muted">
              Try another search or category, or{" "}
              <Link href="/create" className="font-semibold text-brand hover:underline">
                create the first listing
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function BrowseListingsFallback() {
  return (
    <div aria-busy="true" aria-label="Loading listings" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:ml-70 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-lg bg-surface" />
      ))}
    </div>
  );
}
