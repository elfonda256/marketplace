import { NextResponse, type NextRequest } from "next/server";
import { createOnboardingLink, getSeller } from "@/lib/server/sellers";

/** Stripe sends sellers here when an onboarding link expires; we issue a fresh one. */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") ?? "";
  const seller = email ? await getSeller(email) : null;

  if (!seller || seller.charges_enabled) {
    return NextResponse.redirect(new URL("/sell", request.url));
  }
  return NextResponse.redirect(await createOnboardingLink(seller, request.nextUrl.origin));
}
