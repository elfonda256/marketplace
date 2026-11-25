import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/browse";
import { getImageUrl, type Listing } from "@/lib/listings";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/item/${listing.id}`}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        <Image
          src={getImageUrl(listing.image_path)}
          alt={listing.title}
          fill
          sizes="(min-width: 1280px) 240px, (min-width: 640px) 30vw, 50vw"
          className="object-cover transition group-hover:scale-105"
        />
      </div>
      <p className="mt-2 font-bold text-ink">{formatPrice(listing.price)}</p>
      <p className="line-clamp-2 text-sm text-ink">{listing.title}</p>
      <p className="text-xs text-muted">{listing.location}</p>
    </Link>
  );
}
