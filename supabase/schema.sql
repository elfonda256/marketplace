-- Marketplace schema: listings, buyer messages, and a public bucket for listing photos.

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 100),
  description text not null default '' check (char_length(description) <= 2000),
  price numeric(10, 2) not null check (price >= 0 and price <= 1000000),
  category text not null check (category in (
    'electronics', 'furniture', 'home-goods', 'apparel', 'vehicles',
    'books', 'sporting-goods', 'toys-games', 'free-stuff', 'other'
  )),
  seller_email text not null
    check (char_length(seller_email) <= 254 and seller_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  location text not null default 'Palo Alto, CA' check (char_length(trim(location)) between 1 and 100),
  -- Storage path inside the listing-images bucket, e.g. "<uuid>.jpg". Paths, not URLs,
  -- so a listing can only show a photo that was uploaded to this project.
  image_path text not null check (image_path ~ '^[0-9a-f-]{36}\.(jpg|png|webp|gif)$'),
  created_at timestamptz not null default now()
);

create index listings_created_at_idx on public.listings (created_at desc);
create index listings_category_created_at_idx on public.listings (category, created_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_email text not null
    check (char_length(buyer_email) <= 254 and buyer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text not null check (char_length(trim(message)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index messages_listing_id_idx on public.messages (listing_id);

alter table public.listings enable row level security;
alter table public.messages enable row level security;

-- Listings are public: anyone may browse and post, nobody may edit or delete through the API.
create policy "Anyone can view listings"
  on public.listings for select
  to anon, authenticated
  using (true);

create policy "Anyone can create listings"
  on public.listings for insert
  to anon, authenticated
  with check (true);

-- Messages are write-only for visitors. There is no select policy, so buyer emails
-- and message text can't be read back through the public API.
create policy "Anyone can message a seller"
  on public.messages for insert
  to anon, authenticated
  with check (true);

-- Public bucket for listing photos: images only, up to 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

create policy "Anyone can upload listing images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'listing-images');

-- ---------------------------------------------------------------------------
-- Test 4: Stripe Connect
-- ---------------------------------------------------------------------------

-- Sellers who connected Stripe, identified by the email on their listings.
create table public.sellers (
  email text primary key
    check (char_length(email) <= 254 and email = lower(email) and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  stripe_account_id text not null unique check (stripe_account_id ~ '^acct_'),
  charges_enabled boolean not null default false,
  details_submitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per paid Checkout Session. The unique session id makes recording idempotent,
-- so the webhook and the success page can both record the same payment safely.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete restrict,
  stripe_checkout_session_id text not null unique,
  stripe_account_id text not null,
  amount_total integer not null check (amount_total > 0),
  application_fee integer not null check (application_fee >= 0),
  currency text not null,
  buyer_email text,
  created_at timestamptz not null default now()
);

create index orders_listing_id_idx on public.orders (listing_id);

alter table public.listings
  add column status text not null default 'available' check (status in ('available', 'sold')),
  add column sold_at timestamptz;

-- RLS on with no policies: only the server, using the secret key, can read or write these.
alter table public.sellers enable row level security;
alter table public.orders enable row level security;
