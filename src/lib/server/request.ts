import "server-only";
import { headers } from "next/headers";

/** The site's own origin, e.g. https://marketplace.example, for Stripe return URLs. */
export async function getOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}
