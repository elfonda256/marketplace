import type { Metadata } from "next";
import { CreateListingForm } from "@/components/CreateListingForm";

export const metadata: Metadata = { title: "Create listing" };

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold text-ink">Create a listing</h1>
      <p className="mb-6 text-sm text-muted">Add a photo and a few details. Buyers will message you by email.</p>
      <CreateListingForm />
    </div>
  );
}
