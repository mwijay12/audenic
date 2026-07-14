-- =============================================================================
-- Audenic Audio — seed data for local development
-- =============================================================================
-- Creates a couple of test users (via auth.users) and a few sample orders
-- so you can test the /account, /orders, /checkout flows without
-- going through the full signup flow.
--
-- Passwords are 'audenic-test-2026' for ALL test users.
-- DO NOT run this in production.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Test user 1: Mwijay (admin) — Davie
-- ---------------------------------------------------------------------------
do $$
declare
  mwijay_id uuid;
  mwalimu_id uuid;
begin
  -- Mwijay
  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'mwijay@audenic.co.tz',
    crypt('audenic-test-2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Davie Byanmwijage"}',
    now(), now()
  )
  returning id into mwijay_id;

  -- Mwalimu (regular customer)
  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'mwalimu@audenic.co.tz',
    crypt('audenic-test-2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mwalimu Juma"}',
    now(), now()
  )
  returning id into mwalimu_id;

  -- Mwijay is admin
  update public.profiles
    set role = 'admin', phone = '+255713000111', marketing_opt_in = true
    where id = mwijay_id;

  -- Mwalimu is a regular customer in Mwanza
  update public.profiles
    set phone = '+255755222333', marketing_opt_in = true
    where id = mwalimu_id;

  -- Sample addresses
  insert into public.addresses (user_id, label, recipient_name, phone, line1, line2, city, region, is_default) values
    (mwijay_id, 'Home', 'Davie Byanmwijage', '+255713000111',
     'House 14, Mwenge', 'Mikocheni area', 'Dar es Salaam', 'Dar es Salaam', true),
    (mwijay_id, 'Studio', 'Audenic Studio', '+255713000111',
     'Plot 23, Bagamoyo Road', 'Mikocheni Light Industrial', 'Dar es Salaam', 'Dar es Salaam', false),
    (mwalimu_id, 'Home', 'Mwalimu Juma', '+255755222333',
     'Nyakato Area, Block C', 'Near Nyakato Secondary', 'Mwanza', 'Mwanza', true);

  -- Sample order 1: Mwijay buys 1× Audenic Classic (Flame Red)
  insert into public.orders (
    user_id, status, subtotal_tsh, shipping_tsh, tax_tsh, total_tsh,
    payment_method, payment_reference, paid_at,
    shipping_address, customer_note
  ) values (
    mwijay_id, 'shipped', 43500, 0, 0, 43500,
    'mpesa', 'QGH8X4M2P9', now() - interval '3 days',
    jsonb_build_object(
      'recipient_name', 'Davie Byanmwijage',
      'phone', '+255713000111',
      'line1', 'House 14, Mwenge',
      'line2', 'Mikocheni area',
      'city', 'Dar es Salaam',
      'region', 'Dar es Salaam',
      'country', 'Tanzania'
    ),
    'Please leave at the gate if no one is home.'
  );

  insert into public.order_items (
    order_id, product_id, product_slug, product_name, product_image,
    color_name, color_hex, unit_price_tsh, quantity, line_total_tsh
  )
  select id, 'p-001', 'audenic-classic-red', 'Audenic Classic',
         'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
         'Flame Red', '#D4321C', 43500, 1, 43500
  from public.orders where user_id = mwijay_id and payment_reference = 'QGH8X4M2P9'
  limit 1;

  -- Sample order 2: Mwalimu buys 2× Mwanga Buds (Onyx Black) + 1× Arua Blue
  insert into public.orders (
    user_id, status, subtotal_tsh, shipping_tsh, tax_tsh, total_tsh,
    payment_method, payment_reference, paid_at,
    shipping_address
  ) values (
    mwalimu_id, 'delivered', 14900 * 2 + 23600, 5000, 0, 14900 * 2 + 23600 + 5000,
    'tigopesa', 'TGP-2026-7891', now() - interval '14 days',
    jsonb_build_object(
      'recipient_name', 'Mwalimu Juma',
      'phone', '+255755222333',
      'line1', 'Nyakato Area, Block C',
      'line2', 'Near Nyakato Secondary',
      'city', 'Mwanza',
      'region', 'Mwanza',
      'country', 'Tanzania'
    )
  );

  insert into public.order_items (
    order_id, product_id, product_slug, product_name, product_image,
    color_name, color_hex, unit_price_tsh, quantity, line_total_tsh
  )
  select id, 'p-004', 'mwanga-buds', 'Mwanga Buds',
         'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600',
         'Onyx Black', '#0A0A0A', 14900, 2, 14900 * 2
  from public.orders where user_id = mwalimu_id and payment_reference = 'TGP-2026-7891'
  limit 1;

  insert into public.order_items (
    order_id, product_id, product_slug, product_name, product_image,
    color_name, color_hex, unit_price_tsh, quantity, line_total_tsh
  )
  select id, 'p-002', 'arua-blue', 'Arua Blue',
         'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
         'Lake Blue', '#1E5FA8', 23600, 1, 23600
  from public.orders where user_id = mwalimu_id and payment_reference = 'TGP-2026-7891'
  limit 1;

  -- Sample wishlist
  insert into public.wishlists (user_id, product_id) values
    (mwijay_id, 'p-003'),  -- Kifaru Pro
    (mwalimu_id, 'p-001'); -- Audenic Classic

  -- Sample reviews
  insert into public.reviews (user_id, product_id, rating, title, body, verified_purchase) values
    (mwalimu_id, 'p-004', 5, 'Kubwa sana!',
     'Sound ni safi, battery inaendelea masaa 50+. Nimeipenda sana.',
     true),
    (mwijay_id, 'p-001', 5, 'The flagship delivers.',
     'Hand-tuned drivers make a real difference. Bass is tight, mids are warm. Worth every shilling.',
     true);

  -- Newsletter subscribers
  insert into public.newsletter_subscribers (email, source) values
    ('aminata@example.co.tz', 'homepage'),
    ('kevin@example.co.tz', 'cart'),
    ('fatma@example.co.tz', 'footer')
  on conflict (email) do nothing;

  -- A few analytics events
  insert into public.analytics_events (event_name, user_id, properties) values
    ('product_view', mwijay_id, '{"product_id":"p-001","slug":"audenic-classic-red"}'),
    ('add_to_cart',  mwijay_id, '{"product_id":"p-001","color":"Flame Red","quantity":1}'),
    ('product_view', mwalimu_id, '{"product_id":"p-004","slug":"mwanga-buds"}');

  raise notice 'Seed complete. Test users:';
  raise notice '  mwijay@audenic.co.tz  (admin) — audenic-test-2026';
  raise notice '  mwalimu@audenic.co.tz (customer) — audenic-test-2026';
end $$;
