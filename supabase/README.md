# Audenic Audio — Supabase setup

Postgres database + auth + storage for Audenic Audio.

## Architecture

```
Audenic React App (Vite)
        │
        │  @supabase/supabase-js (browser)
        ▼
┌────────────────────┐
│  Supabase project  │
│                    │
│  • Postgres        │  ← supabase/schema.sql
│  • Auth            │  ← magic link, email+pw
│  • Storage         │  ← product images, avatars
│  • Row Level Sec   │  ← supabase/rls.sql
└────────────────────┘
```

## 5-step local setup

### 1. Create a Supabase project

1. Go to https://supabase.com/dashboard
2. Click **New project**
3. Name: `audenic-dev`, choose the closest region (Singapore for TZ users)
4. Save the **database password** somewhere safe
5. Wait ~2 min for provisioning

### 2. Run the schema

In the Supabase dashboard, go to **SQL Editor → New query** and paste the
contents of `schema.sql`. Click **Run**. You should see 8 tables created:

- `profiles`
- `addresses`
- `orders`
- `order_items`
- `wishlists`
- `reviews`
- `newsletter_subscribers`
- `analytics_events`

### 3. Run RLS

Same SQL Editor, new query → paste `rls.sql` → **Run**. Every table is now
locked down: users can only see/modify their own data, except for reviews
(which are public-readable so product pages can show them).

### 4. (Optional) Run the seed

New query → paste `seed.sql` → **Run**. This creates two test users:

- `mwijay@audenic.co.tz` (admin) — password: `audenic-test-2026`
- `mwalimu@audenic.co.tz` (customer) — password: `audenic-test-2026`

Plus sample addresses, orders, reviews, wishlist items, and analytics events.

### 5. Wire the env vars

In the Supabase dashboard, go to **Settings → API**. Copy:

- **Project URL** (e.g. `https://abcdefg.supabase.co`)
- **anon public key** (the long `eyJ...` JWT — safe in browser)

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Paste the two values:

```env
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Restart `npm run dev`. The console should no longer show the
`[supabase] VITE_SUPABASE_URL is not set` warning.

## Verifying the connection

Open `http://localhost:5173` in the browser, then in DevTools console:

```js
// Should resolve, not error
const { data, error } = await window.__supabase_test = await import('/src/lib/supabase.ts')
  .then(m => m.supabase.from('products_meta').select('*').limit(1))
```

(For real testing, use the actual UI: try signing up, then check that a
`profiles` row was created in the Supabase dashboard.)

## Production checklist

- [ ] Disable email autoconfirm in production (Settings → Auth)
- [ ] Set up a custom SMTP (Settings → Auth → SMTP) so emails come from
      `no-reply@audenic.co.tz` not `noreply@mail.app.supabase.io`
- [ ] Configure password policy (min length, complexity)
- [ ] Set up backup schedule (Pro plan only)
- [ ] Add a custom domain for the auth callback URL
- [ ] Add M-Pesa webhook receiver (separate Edge Function)

## File map

| File | Purpose |
|---|---|
| `schema.sql` | All tables, triggers, indexes |
| `rls.sql` | Row Level Security policies |
| `seed.sql` | Test data for local dev (2 users, 2 orders, addresses, reviews) |
| `README.md` | This file |
| `../src/lib/supabase.ts` | Browser client singleton |

## Common questions

**Why Supabase, not Firebase?**
E-commerce is relational data: users → orders → order_items → products.
Postgres handles joins, transactions, and ACID refunds natively. Firestore
makes you denormalize everything and write fan-out update logic.

**Why email magic link, not phone/SMS?**
SMS costs $0.01–$0.06 per verification (Firebase) or requires Twilio setup
(Supabase). Email magic link is free, works on any TZ phone with data, and
is what most premium e-commerce uses (Apple, Notion, Linear).

**Can I add phone auth later?**
Yes. In Supabase dashboard: Authentication → Providers → Phone → enable
Twilio. Then in `src/lib/supabase.ts` add a signInWithOtp call.

**Where do product images go?**
Upload to Supabase Storage bucket `product-images` (public read, admin write).
The browser client gets a public URL like
`https://<ref>.supabase.co/storage/v1/object/public/product-images/foo.jpg`.
