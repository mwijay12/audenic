-- =============================================================================
-- Audenic Audio — Postgres schema
-- =============================================================================
-- Run this in Supabase SQL Editor (or via `supabase db push`).
-- Idempotent: safe to re-run; uses IF NOT EXISTS where possible.
--
-- All monetary values are stored in WHOLE TANZANIAN SHILLINGS (TSh) as integer.
-- All timestamps are TIMESTAMPTZ (timezone-aware) in UTC; convert on the client.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles — extends auth.users with Audenic-specific fields
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  phone           text,                                   -- E.164, e.g. +255712345678
  avatar_url      text,
  marketing_opt_in boolean not null default false,
  role            text not null default 'customer'         -- 'customer' | 'admin' | 'staff'
                    check (role in ('customer', 'admin', 'staff')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_profiles_role  on public.profiles (role);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Touch updated_at on any update
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2. addresses — shipping/billing addresses per user
-- ---------------------------------------------------------------------------
create table if not exists public.addresses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  label           text,                                   -- 'Home', 'Office', 'Mom'
  recipient_name  text not null,
  phone           text not null,                          -- delivery contact
  line1           text not null,                          -- street, house number
  line2           text,                                   -- apt, suite, neighborhood
  city            text not null,                          -- Dar es Salaam, Arusha, Mwanza
  region          text not null,                          -- Dar es Salaam, Arusha, etc.
  postal_code     text,
  country         text not null default 'Tanzania',
  is_default      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_addresses_user on public.addresses (user_id);

-- Enforce: at most ONE default address per user
create unique index if not exists uniq_addresses_default_per_user
  on public.addresses (user_id)
  where is_default = true;

-- ---------------------------------------------------------------------------
-- 3. orders — one row per checkout
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete restrict,
  order_number        text not null unique,                -- human-friendly, e.g. AUD-2026-000123
  status              text not null default 'pending'
                        check (status in (
                          'pending',     -- created, awaiting payment
                          'paid',        -- payment confirmed
                          'processing',  -- being picked/packed
                          'shipped',     -- in transit
                          'delivered',
                          'cancelled',
                          'refunded'
                        )),
  -- Money (TSh, whole)
  subtotal_tsh        integer not null check (subtotal_tsh  >= 0),
  shipping_tsh        integer not null default 0 check (shipping_tsh >= 0),
  tax_tsh             integer not null default 0 check (tax_tsh      >= 0),
  total_tsh           integer not null check (total_tsh    >= 0),
  -- Payment
  payment_method      text                                  -- 'mpesa' | 'tigopesa' | 'airtel_money' | 'card' | 'cod'
                          check (payment_method in ('mpesa','tigopesa','airtel_money','card','cod')),
  payment_reference   text,                                -- mpesa transaction id, etc.
  paid_at             timestamptz,
  -- Shipping snapshot (denormalize so old orders still display the address)
  shipping_address    jsonb not null,
  -- Notes
  customer_note       text,
  internal_note       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_orders_user      on public.orders (user_id);
create index if not exists idx_orders_status    on public.orders (status);
create index if not exists idx_orders_created   on public.orders (created_at desc);

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- Auto-generate human-friendly order_number (AUD-YYYY-NNNNNN)
create or replace function public.assign_order_number()
returns trigger
language plpgsql
as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq integer;
begin
  -- Find the next sequence number for this year
  select coalesce(max(
    nullif(split_part(order_number, '-', 3), '')::integer
  ), 0) + 1
    into seq
  from public.orders
  where order_number like 'AUD-' || yr || '-%';

  new.order_number := 'AUD-' || yr || '-' || lpad(seq::text, 6, '0');
  return new;
end;
$$;

drop trigger if exists orders_assign_number on public.orders;
create trigger orders_assign_number
  before insert on public.orders
  for each row
  when (new.order_number is null or new.order_number = '')
  execute function public.assign_order_number();

-- ---------------------------------------------------------------------------
-- 4. order_items — line items, one row per product/color/qty
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      text not null,                          -- matches products.id from src/data
  product_slug    text not null,                          -- denormalized for /shop/<slug>
  product_name    text not null,                          -- snapshot at purchase time
  product_image   text,
  color_name      text not null,
  color_hex       text not null,
  unit_price_tsh  integer not null check (unit_price_tsh >= 0),
  quantity        integer not null check (quantity > 0),
  line_total_tsh  integer not null check (line_total_tsh >= 0)
);

create index if not exists idx_order_items_order   on public.order_items (order_id);
create index if not exists idx_order_items_product on public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- 5. wishlists — saved products per user
-- ---------------------------------------------------------------------------
create table if not exists public.wishlists (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  product_id      text not null,                          -- matches products.id
  added_at        timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists idx_wishlists_user on public.wishlists (user_id);

-- ---------------------------------------------------------------------------
-- 6. reviews — verified-buyer reviews per product
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  product_id      text not null,
  rating          integer not null check (rating between 1 and 5),
  title           text,
  body            text,
  verified_purchase boolean not null default false,       -- set true if user bought this product
  created_at      timestamptz not null default now(),
  -- one review per user per product
  unique (user_id, product_id)
);

create index if not exists idx_reviews_product on public.reviews (product_id);

-- ---------------------------------------------------------------------------
-- 7. newsletter_subscribers — for marketing emails (separate from profiles)
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  source          text default 'homepage',                -- 'homepage' | 'cart' | 'checkout' | 'footer'
  opted_in_at     timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- 8. analytics_events — lightweight event log for product/landing pages
-- ---------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id              bigserial primary key,
  event_name      text not null,                          -- 'product_view', 'add_to_cart', etc.
  user_id         uuid references public.profiles(id) on delete set null,
  session_id      text,
  properties      jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_analytics_event_name on public.analytics_events (event_name);
create index if not exists idx_analytics_created    on public.analytics_events (created_at desc);
