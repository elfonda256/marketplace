import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-brand text-white">
            M
          </span>
          Marketplace
        </Link>
        <Link
          href="/create"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          + Create listing
        </Link>
      </div>
    </header>
  );
}
