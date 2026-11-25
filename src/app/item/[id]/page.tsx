import Link from "next/link";
import { Suspense } from "react";
import { ListingDetail, ListingDetailFallback } from "@/components/ListingDetail";

export default function ListingPage(props: PageProps<"/item/[id]">) {
  return (
    <>
      <Link href="/" className="mb-4 inline-block text-sm font-semibold text-brand hover:underline">
        ← Back to Marketplace
      </Link>
      <Suspense fallback={<ListingDetailFallback />}>
        <ListingDetail params={props.params} />
      </Suspense>
    </>
  );
}
