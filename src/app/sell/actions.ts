"use server";

import { redirect } from "next/navigation";
import { getOrigin } from "@/lib/server/request";
import { createOnboardingLink, getOrCreateSeller } from "@/lib/server/sellers";
import { isValidEmail } from "@/lib/validation";

export type ConnectState = { error?: string; message?: string } | null;

/**
 * There are no logins, so a seller is identified by the email on their listings.
 * An email that is already fully connected never gets a new onboarding link, so
 * someone else can't take over an account that is already receiving payments.
 */
export async function connectWithStripe(_previous: ConnectState, formData: FormData): Promise<ConnectState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { error: "Enter the email address you used on your listings." };
  }

  let onboardingUrl: string;
  try {
    const seller = await getOrCreateSeller(email);
    if (seller.charges_enabled) {
      return { message: "This email is already connected to Stripe and can accept payments." };
    }
    onboardingUrl = await createOnboardingLink(seller, await getOrigin());
  } catch {
    return { error: "Could not reach Stripe. Please try again." };
  }

  // redirect() works by throwing, so it stays outside the try block.
  redirect(onboardingUrl);
}
