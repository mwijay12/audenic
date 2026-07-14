-- =============================================================================
-- Audenic Audio — Row Level Security
-- =============================================================================
-- RLS ensures users can only see/modify their own data.
-- The anon key is safe in the browser BECAUSE these policies exist.
--
-- Run AFTER schema.sql. Idempotent.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: is the current user an admin?
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- ===========================================================================
-- profiles
-- ===========================================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own"      on public.profiles;
drop policy if exists "profiles_select_admin"    on public.profiles;
drop policy if exists "profiles_insert_own"      on public.profiles;
drop policy if exists "profiles_update_own"      on public.profiles;
drop policy if exists "profiles_update_admin"    on public.profiles;
drop policy if exists "profiles_delete_own"      on public.profiles;

-- Users can read their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins can read all profiles
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- A profile row is created by the auth.users trigger (security definer),
-- so the client doesn't normally insert. But allow self-insert just in case.
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update any profile (e.g. change role)
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- Users can delete their own profile
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- ===========================================================================
-- addresses
-- ===========================================================================
alter table public.addresses enable row level security;

drop policy if exists "addresses_select_own"   on public.addresses;
drop policy if exists "addresses_insert_own"   on public.addresses;
drop policy if exists "addresses_update_own"   on public.addresses;
drop policy if exists "addresses_delete_own"   on public.addresses;

create policy "addresses_select_own"
  on public.addresses for select using (auth.uid() = user_id);

create policy "addresses_insert_own"
  on public.addresses for insert with check (auth.uid() = user_id);

create policy "addresses_update_own"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "addresses_delete_own"
  on public.addresses for delete using (auth.uid() = user_id);

-- ===========================================================================
-- orders + order_items
-- ===========================================================================
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;

drop policy if exists "orders_select_own"        on public.orders;
drop policy if exists "orders_select_admin"      on public.orders;
drop policy if exists "orders_insert_own"        on public.orders;
drop policy if exists "orders_update_admin"      on public.orders;

-- Users see their own orders
create policy "orders_select_own"
  on public.orders for select using (auth.uid() = user_id);

-- Admins see all orders (fulfillment dashboard)
create policy "orders_select_admin"
  on public.orders for select using (public.is_admin());

-- Users can create orders for themselves. We DON'T let them update after creation.
create policy "orders_insert_own"
  on public.orders for insert with check (auth.uid() = user_id);

-- Only admins can update orders (mark shipped, refund, etc.)
create policy "orders_update_admin"
  on public.orders for update using (public.is_admin());

-- Order items follow their parent order
drop policy if exists "order_items_select"   on public.order_items;
drop policy if exists "order_items_insert"   on public.order_items;
drop policy if exists "order_items_update"   on public.order_items;
drop policy if exists "order_items_delete"   on public.order_items;

create policy "order_items_select"
  on public.order_items for select
  using (
    exists (select 1 from public.orders o where o.id = order_items.order_id and (
      o.user_id = auth.uid() or public.is_admin()
    ))
  );

create policy "order_items_insert"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );

create policy "order_items_update"
  on public.order_items for update
  using (public.is_admin());

create policy "order_items_delete"
  on public.order_items for delete
  using (public.is_admin());

-- ===========================================================================
-- wishlists
-- ===========================================================================
alter table public.wishlists enable row level security;

drop policy if exists "wishlists_select_own" on public.wishlists;
drop policy if exists "wishlists_insert_own" on public.wishlists;
drop policy if exists "wishlists_delete_own" on public.wishlists;

create policy "wishlists_select_own"
  on public.wishlists for select using (auth.uid() = user_id);

create policy "wishlists_insert_own"
  on public.wishlists for insert with check (auth.uid() = user_id);

create policy "wishlists_delete_own"
  on public.wishlists for delete using (auth.uid() = user_id);

-- ===========================================================================
-- reviews
-- ===========================================================================
alter table public.reviews enable row level security;

-- Reviews are PUBLIC (so product pages can show them without auth)
drop policy if exists "reviews_select_public" on public.reviews;
create policy "reviews_select_public"
  on public.reviews for select using (true);

-- Only authenticated users can post a review
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Authors can edit their own review; admins can edit any
drop policy if exists "reviews_update" on public.reviews;
create policy "reviews_update"
  on public.reviews for update
  using (auth.uid() = user_id or public.is_admin());

-- Authors can delete their own review; admins can delete any
drop policy if exists "reviews_delete" on public.reviews;
create policy "reviews_delete"
  on public.reviews for delete
  using (auth.uid() = user_id or public.is_admin());

-- ===========================================================================
-- newsletter_subscribers
-- ===========================================================================
alter table public.newsletter_subscribers enable row level security;

-- Anyone (anon) can sign up for the newsletter
drop policy if exists "newsletter_insert_public" on public.newsletter_subscribers;
create policy "newsletter_insert_public"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only admins can read the full list
drop policy if exists "newsletter_select_admin" on public.newsletter_subscribers;
create policy "newsletter_select_admin"
  on public.newsletter_subscribers for select using (public.is_admin());

-- ===========================================================================
-- analytics_events
-- ===========================================================================
alter table public.analytics_events enable row level security;

-- Anyone can log events (we use this from the browser for product views, etc.)
drop policy if exists "analytics_insert_public" on public.analytics_events;
create policy "analytics_insert_public"
  on public.analytics_events for insert
  with check (true);

-- Only admins can read analytics
drop policy if exists "analytics_select_admin" on public.analytics_events;
create policy "analytics_select_admin"
  on public.analytics_events for select using (public.is_admin());
