# Marketplace

A small buy-and-sell marketplace built with Next.js (App Router), React 19, TypeScript, Tailwind CSS and Supabase (Postgres and Storage).

No login is needed. Anyone can post a listing with a photo, browse and search listings by category or keyword, open a listing's own page, and send the seller a message.

## Features

- **Create listing:** photo, title, description, price, seller email, category and location. The photo goes to Supabase Storage and the listing to Postgres.
- **Browse:** responsive grid of the newest listings with category tabs.
- **Search (bonus):** keyword search over titles and descriptions, combinable with a category. Filters live in the URL (`/?category=books&q=novel`), so results can be shared and survive a refresh.
- **Listing page:** large photo, price, category, location, posting time, description and seller email.
- **Message Seller:** saves the buyer's email and message in Supabase and confirms it was sent.

## Getting started

Requires Node.js 20.9 or later and a Supabase project.

1. In the Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates the `listings` and `messages` tables, their row level security policies and the `listing-images` storage bucket.
2. Copy `.env.example` to `.env.local` and fill in the project URL and the publishable key.
3. Run:

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (Vitest)
npm run lint
npm run build && npm start
```

On Vercel, add the same two variables under Project → Settings → Environment Variables.

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # Header and page frame
│   ├── page.tsx                # Browse and search
│   ├── create/page.tsx         # Create listing
│   └── item/[id]/              # Listing page and its not-found page
├── components/
│   ├── BrowseListings.tsx      # Server component: reads filters, fetches, renders grid
│   ├── BrowseSidebar.tsx       # Search box and category tabs
│   ├── ListingCard.tsx         # One grid item
│   ├── ListingDetail.tsx       # Server component: one listing
│   ├── CreateListingForm.tsx   # Client form: validate, upload, insert
│   ├── MessageSellerForm.tsx   # Client form: validate, insert message
│   └── SiteHeader.tsx
└── lib/
    ├── validation.ts           # Listing and message validation (pure)
    ├── browse.ts               # URL filters, safe search pattern, price format (pure)
    ├── categories.ts           # Category list
    ├── photo.ts, time.ts       # Photo checks, "2 hours ago" (pure)
    ├── listings.ts             # All Supabase queries and uploads
    ├── supabase.ts             # Supabase client
    └── *.test.ts               # Unit tests for the pure modules
supabase/
└── schema.sql
```

## Design decisions

- **Server components for reading, client components for writing.** The browse and listing pages fetch on the server, so the first load already contains the listings. Only the two forms run in the browser. With Next.js Cache Components, each data read sits inside `<Suspense>`, so the page shell is prerendered and the listings stream in fresh on every request.
- **Filters in the URL.** Category tabs are links and search is a GET form (`next/form`). There is no client state to keep in sync, and the back button works.
- **Safe search.** `toSearchPattern` strips characters that have a meaning in PostgREST filters or `LIKE` patterns before they reach the query, and it is unit tested.
- **Rules enforced twice.** The forms validate input for quick feedback. Check constraints in Postgres enforce the same limits (title length, price range, category list, email format) for anyone calling the API directly.
- **Messages are write-only.** The example schema let anyone read every message. Here there is no select policy on `messages`, so buyer emails and message text can't be read through the public API. Sellers would read them through the Supabase dashboard or a future authenticated inbox.
- **Photos are stored as paths.** `image_path` only accepts `<uuid>.<ext>`, and the app builds the public URL, so a listing can't point at an image hosted elsewhere.
- **Known limits.** There is no authentication, so listings can't be edited or deleted from the site, and there is no spam protection. Emailing the seller when a message arrives (a bonus) would need an email provider and a verified sending domain.
