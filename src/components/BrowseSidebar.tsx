import Form from "next/form";
import Link from "next/link";
import { buildBrowseHref, type BrowseFilters } from "@/lib/browse";
import { CATEGORIES } from "@/lib/categories";

const tabClass = (isActive: boolean) =>
  [
    "shrink-0 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition",
    "focus-visible:outline-2 focus-visible:outline-brand",
    isActive ? "bg-brand-soft text-brand" : "text-ink hover:bg-surface",
  ].join(" ");

export function BrowseSidebar({ filters }: { filters: BrowseFilters }) {
  const tabs = [{ slug: null, label: "All listings" }, ...CATEGORIES];

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:w-64 lg:shrink-0 lg:self-start">
      <Form action="/" role="search" className="flex gap-2">
        {filters.category && <input type="hidden" name="category" value={filters.category} />}
        <label htmlFor="search" className="sr-only">
          Search listings
        </label>
        <input
          id="search"
          name="q"
          type="search"
          defaultValue={filters.query}
          placeholder="Search Marketplace"
          className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-brand"
        />
        <button
          type="submit"
          className="rounded-full bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Search
        </button>
      </Form>

      <nav aria-label="Categories">
        <h2 className="mb-2 hidden px-3 text-base font-bold text-ink lg:block">Categories</h2>
        <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {tabs.map(({ slug, label }) => {
            const isActive = filters.category === slug;
            return (
              <li key={label}>
                <Link
                  href={buildBrowseHref({ category: slug, query: filters.query })}
                  aria-current={isActive ? "page" : undefined}
                  className={tabClass(isActive)}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
