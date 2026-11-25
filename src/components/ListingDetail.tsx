import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildBrowseHref, formatPrice, isUuid } from "@/lib/browse";
import { categoryLabel } from "@/lib/categories";
import { fetchListing, getImageUrl } from "@/lib/listings";
import { formatRelativeTime } from "@/lib/time";
import { MessageSellerForm } from "./MessageSellerForm";

export async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = isUuid(id) ? await fetchListing(id) : null;
  if (!listing) notFound();

  return (
    <article className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-photo lg:aspect-auto lg:min-h-[560px]">
        <Image
          src={getImageUrl(listing.image_path)}
          alt={listing.title}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-contain"
        />
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <Link
            href={buildBrowseHref({ category: listing.category, query: "" })}
            className="text-sm font-semibold text-brand hover:underline"
          >
            {categoryLabel(listing.category)}
          </Link>
          <h1 className="mt-1 text-2xl font-bold break-words text-ink">{listing.title}</h1>
          <p className="mt-1 text-xl font-semibold text-ink">{formatPrice(listing.price)}</p>
          <p className="mt-1 text-sm text-muted">
            Listed <time dateTime={listing.created_at}>{formatRelativeTime(listing.created_at)}</time> in{" "}
            {listing.location}
          </p>
        </div>

        <section>
          <h2 className="font-bold text-ink">Details</h2>
          <p className="mt-1 text-sm whitespace-pre-line break-words text-ink">
            {listing.description || "No description provided."}
          </p>
        </section>

        <section>
          <h2 className="font-bold text-ink">Seller</h2>
          <a href={`mailto:${listing.seller_email}`} className="text-sm text-brand hover:underline">
            {listing.seller_email}
          </a>
        </section>

        <MessageSellerForm listingId={listing.id} />
      </div>
    </article>
  );
}

export function ListingDetailFallback() {
  return (
    <div aria-busy="true" aria-label="Loading listing" className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="aspect-square animate-pulse rounded-lg bg-surface lg:aspect-auto lg:min-h-[560px]" />
      <div className="h-64 animate-pulse rounded-lg bg-surface" />
    </div>
  );
}
