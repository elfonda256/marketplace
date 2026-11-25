"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/categories";
import { createListing } from "@/lib/listings";
import { ACCEPTED_PHOTO_TYPES, validatePhoto } from "@/lib/photo";
import { DEFAULT_LOCATION, LIMITS, validateListing, type ListingForm } from "@/lib/validation";

const EMPTY_FORM: ListingForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  sellerEmail: "",
  location: "",
};

const inputClass =
  "w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-brand";

export function CreateListingForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState<{ file: File; previewUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function update(field: keyof ListingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handlePhotoChange(file: File | undefined) {
    if (!file) return;
    const photoError = validatePhoto(file);
    if (photoError) {
      setError(photoError);
      return;
    }
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    setError(null);
    setPhoto({ file, previewUrl: URL.createObjectURL(file) });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      setError("Add a photo of the item.");
      return;
    }
    const result = validateListing(form);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const id = await createListing(result.value, photo.file);
      router.push(`/item/${id}`);
    } catch {
      setIsSaving(false);
      setError("Could not publish your listing. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">Photo</span>
        <label
          htmlFor="photo"
          className="relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-lg border-2 border-dashed border-line bg-surface text-center text-sm text-muted hover:border-brand focus-within:outline-2 focus-within:outline-brand"
        >
          {photo ? (
            <Image src={photo.previewUrl} alt="Selected photo" fill unoptimized className="object-cover" />
          ) : (
            <span className="px-4">
              <span className="block text-2xl">＋</span>
              Add a photo (JPG, PNG, WebP or GIF, up to 5 MB)
            </span>
          )}
          <input
            id="photo"
            type="file"
            accept={ACCEPTED_PHOTO_TYPES}
            onChange={(event) => handlePhotoChange(event.target.files?.[0])}
            className="sr-only"
          />
        </label>
        {photo && <span className="text-xs text-muted">Click the photo to change it.</span>}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium text-ink">
            Title
          </label>
          <input
            id="title"
            required
            maxLength={LIMITS.titleMax}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="price" className="text-sm font-medium text-ink">
              Price (USD, 0 for free)
            </label>
            <input
              id="price"
              required
              inputMode="decimal"
              placeholder="0.00"
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-sm font-medium text-ink">
              Category
            </label>
            <select
              id="category"
              required
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {CATEGORIES.map(({ slug, label }) => (
                <option key={slug} value={slug}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-ink">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            maxLength={LIMITS.descriptionMax}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="seller-email" className="text-sm font-medium text-ink">
              Your email
            </label>
            <input
              id="seller-email"
              type="email"
              required
              autoComplete="email"
              value={form.sellerEmail}
              onChange={(event) => update("sellerEmail", event.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="location" className="text-sm font-medium text-ink">
              Location
            </label>
            <input
              id="location"
              maxLength={LIMITS.locationMax}
              placeholder={DEFAULT_LOCATION}
              value={form.location}
              onChange={(event) => update("location", event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {isSaving ? "Publishing..." : "Publish listing"}
        </button>
      </div>
    </form>
  );
}
