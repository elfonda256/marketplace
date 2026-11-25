import Link from "next/link";

export default function ListingNotFound() {
  return (
    <div className="rounded-lg bg-surface p-8 text-center">
      <h1 className="text-xl font-bold text-ink">Listing not found</h1>
      <p className="mt-1 text-sm text-muted">It may have been removed, or the link is wrong.</p>
      <Link href="/" className="mt-4 inline-block font-semibold text-brand hover:underline">
        Browse all listings
      </Link>
    </div>
  );
}
