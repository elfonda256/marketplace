# Marketplace

A small buy-and-sell marketplace built with Next.js (App Router), React 19, TypeScript, Tailwind CSS, Supabase (Postgres and Storage) and Stripe Connect.

No login is needed. Anyone can post a listing with a photo, browse and search listings by category or keyword, open a listing's own page and message the seller. Sellers can connect Stripe to get paid, and buyers can then purchase with **Buy Now**. Stripe runs in test mode, so no real money moves.

## Features

- **Create listing:** photo, title, description, price, seller email, category and location. The photo goes to Supabase Storage and the listing to Postgres.
- **Browse:** responsive grid of the newest listings with category tabs. Sold items carry a "Sold" badge.
- **Search:** keyword search over titles and descriptions, combinable with a category. Filters live in the URL (`/?category=books&q=novel`), so results can be shared and survive a refresh.
- **Listing page:** large photo, price, category, location, posting time, description and seller email.
- **Message Seller:** saves the buyer's email and message in Supabase.
- **Get paid (Stripe Connect):** a seller enters the email on their listings and completes Stripe's hosted onboarding. The connected account is saved in Supabase.
- **Buy Now:** listings from onboarded sellers open Stripe Checkout. The payment is a direct charge on the seller's account with a 10% application fee for the marketplace.
- **Order confirmation:** after payment, a success page shows what was paid, what the seller receives and the fee. A Stripe webhook records the order in Supabase and marks the listing as Sold.

## How a payment flows

1. The seller submits their email at `/sell`. The server creates a connected account (or reuses the saved one), stores it in `sellers` and redirects to a Stripe onboarding link.
2. Stripe sends the seller back to `/sell/return`, which reads the account from Stripe and saves `charges_enabled`. The `account.updated` webhook keeps it in sync afterwards.
3. On a listing page, the server checks the listing and its seller. If the seller can accept payments, **Buy Now** creates a Checkout Session on the seller's account with `application_fee_amount` set to 10%.
4. After payment, `checkout.session.completed` arrives at `/api/stripe/webhook`. The handler verifies the signature, inserts the order and marks the listing as sold. The success page records the same session too, so the buyer never sees a confirmation for an order that isn't saved yet. The unique session id makes both writes safe to repeat.

## Getting started

Requires Node.js 20.9 or later, a Supabase project and a Stripe test-mode account with Connect enabled.

1. In the Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates all tables, row level security policies and the `listing-images` storage bucket.
2. Copy `.env.example` to `.env.local` and fill in the Supabase URL, publishable key and secret key, and the Stripe secret key.
3. Deploy, then register the webhook against your production URL and save the printed secret as `STRIPE_WEBHOOK_SECRET`:

```bash
node --env-file=.env.local scripts/create-webhook.mjs https://your-app.vercel.app
```

4. Run locally:

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (Vitest)
npm run lint
npm run build && npm start
```

On Vercel, add the same variables under Project → Settings → Environment Variables. `.env.local` is git-ignored; secrets never go in the repository.

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Browse and search
│   ├── create/page.tsx           # Create listing
│   ├── item/[id]/                # Listing page, not-found page, buyNow server action
│   ├── sell/                     # Connect with Stripe page, return page, refresh route, server action
│   ├── orders/success/page.tsx   # Order confirmation
│   └── api/stripe/webhook/       # Stripe webhook
├── components/
│   ├── BrowseListings.tsx        # Server component: reads filters, fetches, renders grid
│   ├── ListingDetail.tsx         # Server component: one listing
│   ├── PurchasePanel.tsx         # Server component: Buy Now, Sold or "not connected"
│   ├── BuyNowButton.tsx, ConnectStripeForm.tsx
│   ├── CreateListingForm.tsx, MessageSellerForm.tsx
│   └── BrowseSidebar.tsx, ListingCard.tsx, SoldBadge.tsx, SiteHeader.tsx
└── lib/
    ├── payments.ts               # Cents, 10% fee, "can this be bought?" (pure)
    ├── validation.ts, browse.ts  # Validation, URL filters, safe search (pure)
    ├── categories.ts, photo.ts, time.ts
    ├── listings.ts               # Public Supabase queries and uploads
    ├── supabase.ts               # Public Supabase client
    ├── server/                   # Server-only: Stripe and secret-key Supabase clients,
    │                             # sellers and orders
    └── *.test.ts                 # Unit tests for the pure modules
scripts/
└── create-webhook.mjs            # Registers the Connect webhook endpoint
supabase/
└── schema.sql
```

## Design decisions

- **Direct charges with an application fee.** The Checkout Session is created on the seller's connected account (`stripeAccount`), and `application_fee_amount` sends 10% to the platform. Connected accounts use the controller settings Stripe recommends for direct charges: the seller has the full Stripe Dashboard and pays Stripe's fees, and Stripe covers negative balances.
- **Two Supabase clients with different powers.** The browser uses the publishable key and row level security. Server code under `lib/server/` uses the secret key, starts with `import "server-only"` so it can't end up in the browser bundle, and is the only code that touches `sellers` and `orders`. Those tables have RLS on and no policies, so the public API can't read or write them.
- **The server decides what can be bought.** `purchaseState` (unit tested) combines listing status, price and seller status. The Buy Now server action checks it again, so a hidden or stale button can't create a payment.
- **Idempotent order recording.** `stripe_checkout_session_id` is unique and the insert ignores duplicates, so webhook retries and the success page can't create a second order. Marking as sold only updates `available` listings.
- **Shared sandbox.** The webhook also receives other apps' events. An order is only recorded when the session's listing exists here and the paying account is that listing's seller. Anything else is acknowledged with 200 and ignored.
- **Verified webhooks.** The handler reads the raw body and checks the Stripe signature before trusting any event.
- **Earlier decisions:** server components for reading, filters in the URL, database check constraints mirroring form validation, write-only messages, and photos stored as storage paths rather than URLs.
- **Known limits.** Without login, a seller is identified only by email. An email that is already fully connected never gets a new onboarding link, but a production version would verify email ownership first. Listings can't be edited from the site, and there is no spam protection.
