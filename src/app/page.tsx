import { Suspense } from "react";
import { BrowseListings, BrowseListingsFallback } from "@/components/BrowseListings";

export default function HomePage(props: PageProps<"/">) {
  return (
    <Suspense fallback={<BrowseListingsFallback />}>
      <BrowseListings searchParams={props.searchParams} />
    </Suspense>
  );
}
