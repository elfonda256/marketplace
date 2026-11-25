import { toSearchPattern, type BrowseFilters } from "./browse";
import type { CategorySlug } from "./categories";
import { buildPhotoPath } from "./photo";
import { supabase } from "./supabase";
import type { ListingInput, MessageInput } from "./validation";

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: CategorySlug;
  seller_email: string;
  location: string;
  image_path: string;
  created_at: string;
};

const IMAGE_BUCKET = "listing-images";
const BROWSE_LIMIT = 60;

export function getImageUrl(path: string): string {
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function fetchListings({ category, query }: BrowseFilters): Promise<Listing[]> {
  let request = supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(BROWSE_LIMIT);

  if (category) request = request.eq("category", category);

  const pattern = toSearchPattern(query);
  if (pattern) request = request.or(`title.ilike.${pattern},description.ilike.${pattern}`);

  const { data, error } = await request;
  if (error) throw error;
  return data;
}

export async function fetchListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

/** Uploads the photo, then saves the listing. Returns the new listing's id. */
export async function createListing(input: ListingInput, photo: File): Promise<string> {
  const imagePath = buildPhotoPath(photo.type, crypto.randomUUID());
  const upload = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(imagePath, photo, { contentType: photo.type });
  if (upload.error) throw upload.error;

  const { data, error } = await supabase
    .from("listings")
    .insert({
      title: input.title,
      description: input.description,
      price: input.price,
      category: input.category,
      seller_email: input.sellerEmail,
      location: input.location,
      image_path: imagePath,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Messages are write-only for visitors, so this inserts without reading the row back. */
export async function sendMessage(listingId: string, { buyerEmail, message }: MessageInput) {
  const { error } = await supabase
    .from("messages")
    .insert({ listing_id: listingId, buyer_email: buyerEmail, message });
  if (error) throw error;
}
