# 🎵 Audenic Audio — Premium Music Devices

> Immersive audio engineering, hand-tuned in Dar es Salaam, Tanzania. A high-performance e-commerce frontend integrated with Supabase database, real-time search, interactive profile forms, and custom-tailored sound.

---

## 🚀 SECTION 1: PROJECT IDENTITY
Write this like a product launch announcement.

### Audenic Audio Co. 🎧
**Audenic Audio** makes super-cool, premium headphones and speakers that make your favorite music sound like the band is playing right inside your room, hand-crafted with love in Dar es Salaam!

For developers, **Audenic Audio** is an ultra-premium, production-ready React 18 e-commerce SPA built on Vite, TypeScript 5, and Tailwind CSS. It features micro-interactions and scroll-driven typography animations powered by GSAP, ScrollTrigger, and Framer Motion. The data layer is decoupled and powered by a Supabase Postgres engine (with local cache fallbacks), supporting OTP magic-link authentication, custom row-level security (RLS) policies, order placement, and live client-side address auditing.

For the business, Audenic solves the critical high-friction barriers of online direct-to-consumer (DTC) sales in East Africa. By integrating local Swahili-friendly terms, supporting mobile money payment workflows (M-Pesa, Tigo Pesa, Airtel Money), and optimizing for fast page-load speeds on mobile connections through server-free SPA routing and highly optimized asset delivery, Audenic captures a rapidly growing middle-class demographic looking for local premium quality over imported generic electronics.

* **Current Version**: `v2.0.0`
* **Status Badge**: 🟢 Production Ready / Stable
* **Built by**: **Mwijay Davie** ([mwijay.com](https://mwijay.com)) to prove that high-end DTC audio equipment can have a digital shopping experience that is as smooth, premium, and tactile as the hardware itself.
* **The Audenic Difference**: Unlike generic, template-built e-commerce sites that look like standard AI-generated retail templates, Audenic features a high-fidelity signature design token palette (`cream`, `ink`, `flame`), physical-feeling 3D tilt spotlights on cards, and full smooth scroll animations using Lenis. We completely avoid "AI slop" aesthetics in favor of a clean, editorial layout reminiscent of physical design magazines.

---

## 📸 SECTION 2: LIVE SYSTEM SNAPSHOT
The current state of the system today.

### System Components

| Component | Status | What It Does | Tech Used |
|---|---|---|---|
| **Frontend UI** | 🟢 Active | Renders responsive pages, landing hero, product lineup, specifications, and cart. | React 18, Vite, Tailwind CSS |
| **Animation Engine** | 🟢 Active | Handles Lenis smooth scroll, GSAP ScrollTrigger features, and Framer Motion page routes. | GSAP 3, Lenis, Framer Motion |
| **Search Engine** | 🟢 Active | Real-time keyboard-navigable slide-over search across names, categories, and tags. | React State, Lucide, Zustand |
| **Auth System** | 🟢 Active | Magic-link (OTP) logins and user sessions with Supabase. | Supabase Auth, `useSession` hook |
| **User Profile & Addresses** | 🟢 Active | Editable profile data, phone number, and address lists synced to database. | React Forms, Supabase Postgres |
| **Shopping Cart & Checkout** | 🟢 Active | Zustand store for cart lines, promo code deductions, and order creation. | Zustand, LocalStorage, Supabase DB |

### Feature Checklist
* [x] **Fully Working Features**:
  * Real-time search modal (Ctrl+K or Search button triggers) with instant product results.
  * Interactive user account profile updater (updates full name, phone number, and marketing preferences).
  * Address book manager with label customization, default address constraints, and deletions.
  * Promo code discount manager supporting Tanzanian coupon campaigns (`KARIBU10`, `DARFREE`, `AUDENIC20`).
  * Wishlist ("Vipendwa") tab allowing users to save products locally and sync to the cloud on login.
  * Lenis smooth scrolling bound to GSAP ScrollTrigger for parallax sections.
  * Dynamic particle field generator on the landing hero.
* [ ] **Partially Working Features**:
  * Real-time payment verification (the payment method field is selected, but is currently mock-checked rather than sending SMS payloads to telecommunication push gateways).
  * Avatar upload (UI exists but file uploading to Supabase Storage bucket requires bucket creation permissions).
* [ ] **Planned Features (Not Started)**:
  * Interactive sound tuner widget (a 3-band graphic equalizer playing mock audio waves to match product sound stages).
  * Swahili / English localization translation system switcher in the navigation bar.
* [ ] **Tried and Abandoned**:
  * *Global CSS Parallax*: Replaced by GSAP ScrollTrigger as default CSS parallax caused severe layout stuttering on WebKit browsers (Safari iOS).

---

## 📐 SECTION 3: SYSTEM ARCHITECTURE
A detailed map of how data moves through Audenic.

### System Diagram
```text
                  +-------------------------------------------------+
                  |                   User Browser                  |
                  |                                                 |
                  |  [React SPA] ----(Ctrl+K)----> [Search Drawer]  |
                  |        |                                        |
                  |        +--(Add to Cart)----> [Zustand Cart]     |
                  |        |                                        |
                  |        +--(Save)------------> [Wishlist Store]  |
                  +--------+--------------------------+-------------+
                           |                          |
               (HTTPS Rest / WS)                 (JSON Sync)
                           |                          |
                           v                          v
             +-------------+-------------+    +-------+-------+
             |      Supabase Client      |    | LocalStorage  |
             +------+-----+-------+------+    |  (Offline     |
                    |     |       |           |   Fallback)   |
        (Auth OTP)  |     |       | (Postgres |               |
      +-------------+     |       |  Queries) +---------------+
      |                   |       |
      v                   v       v
+-----+------+   +--------+-------+--------+
|  Supabase  |   |    Supabase Database    |
| Auth Guard |   |  (PostgreSQL + RLS)     |
+------------+   +--------+-------+--------+
                          |       |
                  +-------+       +--------+
                  |                        |
                  v                        v
            [profiles]                [addresses]
            [orders]                  [order_items]
            [wishlists]               [newsletter_subscribers]
```

### Request Flow Walkthrough (Adding to Cart & Checkout)
1. **User interaction**: User clicks "Weka Kikapuni" (Add to Cart) on a product card or clicks "Add to Cart" on the product detail page.
2. **State modification**: The event triggers `useCart.getState().add(product, color, quantity)`.
3. **Zustand pipeline**: Zustand searches `state.lines` for a match on `productId` and `color.name`. If found, it increments the quantity. If not, it pushes a new `CartLine` object. It commits to state, triggers a local storage sync (`audenic-cart`), and calls `get().open()` to open the side drawer.
4. **Checkout Transition**: The user hits "Checkout" and is redirected to `/checkout`.
5. **Pricing Computation**: `calcTotal` calculates the subtotal, checks if the user has applied a coupon code (e.g., `KARIBU10` for 10% off), applies the discount, computes Dar-es-Salaam free shipping or flat rate, and sets the total.
6. **DB Submission**: On submitting the shipping address form, `createOrder` runs:
   * Inserts order row into `orders` table.
   * Supabase database executes `assign_order_number()` trigger to auto-create `AUD-2026-NNNNNN` formatted ID.
   * Inserts line items into `order_items` referencing the returned `order_id`.
   * Clears the cart on success and redirects the user to the `/order/:id` confirmation screen.

---

## 📁 SECTION 4: COMPLETE FILE STRUCTURE
The layout of the codebase and file responsibilities.

```text
audenic-audio-premium/
├── .env.example              # Template for local environment variables
├── .gitignore                # Rules for excluding files from git tracking
├── index.html                # Main HTML template containing Google Font imports
├── package.json              # Project dependencies, scripts, and authors metadata
├── postcss.config.js         # PostCSS configuration for Tailwind compiler
├── tailwind.config.js        # Custom Tailwind spacing, fonts, and Audenic tokens (flame, ink, cream)
├── tsconfig.json             # Root TypeScript config
├── tsconfig.app.json         # TypeScript compiler rules for the React app
├── tsconfig.node.json        # TypeScript compiler rules for the Vite node scripts
├── vite.config.ts            # Vite compiler configuration with tsconfig paths alias mapping
├── public/                   # Static raw assets
│   └── favicon.ico           # Website icon
├── supabase/                 # Database initialization folder
│   ├── README.md             # Supabase specific setup instructions
│   ├── schema.sql            # Core SQL script to create tables, indexes, and triggers
│   ├── rls.sql               # Row-Level Security rules for data access control
│   └── seed.sql              # Initial products & mock data inserts
└── src/                      # Source code
    ├── App.tsx               # Main application routing and route guards
    ├── index.css             # Main stylesheet declaring custom fonts and design tokens
    ├── main.tsx              # Application mount file
    ├── vite-env.d.ts         # TypeScript environment declarations
    ├── components/           # Reusable UI elements
    │   ├── BlurText.tsx      # Split-text entry animator using framer-motion
    │   ├── CartDrawer.tsx    # Slide-over shopping cart drawer
    │   ├── ColorSwatches.tsx # Component to render product color options
    │   ├── Cursor.tsx        # Magnetic/hover-reactive custom mouse pointer
    │   ├── Footer.tsx        # Global footer containing newsletter sign-up
    │   ├── HorizontalShowcase.tsx # GSAP horizontal product slide trigger
    │   ├── Layout.tsx        # Standard layout container with Nav, Footer, and Modals
    │   ├── MagnetButton.tsx  # Magnetic-pull UI button component
    │   ├── Marquee.tsx       # Infinite scrolling text marquee
    │   ├── Nav.tsx           # Global navigation with bag indicator and Search trigger
    │   ├── Parallax.tsx      # Parallax scroll animator
    │   ├── ParticleField.tsx # HTML Canvas-based interactive landing particle animation
    │   ├── Reveal.tsx        # Fade-in-up element reveal on scroll
    │   ├── ScrollLetterShift.tsx # Character displacement animator
    │   ├── ScrollProgress.tsx # Top-page thin linear progress bar
    │   ├── SearchModal.tsx   # Ctrl+K modal overlay with instant product matching
    │   ├── SpotlightCard.tsx # 3D tilting card with spotlight gradient follow-effect
    │   └── Stats.tsx         # Animated counting numeric showcase
    ├── data/                 # Static catalogs
    │   └── products.ts       # Products, extra products, specifications, and features data
    ├── hooks/                # Custom React hooks
    │   └── useSmoothScroll.ts # Custom Lenis scroll initialization bound to GSAP
    ├── lib/                  # Utilities and client wrappers
    │   ├── orders.ts         # Typed database interfaces for order submission
    │   ├── supabase.ts       # Singleton instance configuration and newsletter helper
    │   ├── useSession.ts     # Session tracking with localStorage demo mode fallbacks
    │   └── utils.ts          # Tailwind merge helper and currency formatter
    └── store/                # Global states
        ├── cart.ts           # Cart store with promo code deductions
        ├── search.ts         # Modal open state controller
        └── wishlist.ts       # Wishlist item toggles with Supabase cloud-sync
```

---

## 🛠 SECTION 5: INSTALLATION & SETUP
Get Audenic running locally from scratch.

### 1. Prerequisites
Ensure you have the following software installed:
* **Node.js (v18.0.0 or higher)**: [Download Node.js](https://nodejs.org/)
* **Git**: [Download Git](https://git-scm.com/)
* **VS Code (Recommended)**: [Download VS Code](https://code.visualstudio.com/)

### 2. Environment Variables Configuration
Create a `.env` file in the root of the project.
```bash
# Copy from template
cp .env.example .env
```
Fill out the variables as follows:
```ini
# Supabase credentials (Get these from your Supabase dashboard > Project Settings > API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
> [!NOTE]
> If you leave these variables empty or omit the `.env` file, the application will automatically boot in **Demo Mode (No-DB Mode)** using LocalStorage, allowing you to test all pages and forms.

### 3. Step-by-Step Setup
Run the following commands in your terminal:

```bash
# 1. Clone the repository
git clone https://github.com/mwijay-davie/audenic-audio-premium.git
cd audenic-audio-premium

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```
Expected Output for `npm run dev`:
```text
  VITE v5.4.11  ready in 345 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4. Verification
Open your browser and navigate to `http://localhost:5173/`.
* Scroll down to see if the Lenis smooth scroll and GSAP animations run cleanly.
* Press `Ctrl + K` (or `Cmd + K` on Mac) to verify the Search Modal opens.
* Add an item to the cart. If the Cart Drawer slides open with your item, the installation is verified!

### 5. Troubleshooting Common Setup Errors

* **Error: `VITE_SUPABASE_URL is undefined` Warning in Console**
  * *Reason*: The `.env` file was not created or Vite is not loading it.
  * *Fix*: Make sure the file is named exactly `.env` (not `.env.txt` or `.env.local`) and is placed in the root directory next to `package.json`. Restart the dev server (`Ctrl+C` and `npm run dev`).
* **Error: `Port 5173 is already in use`**
  * *Reason*: Another development server is running in the background.
  * *Fix*: Vite will automatically assign a different port (e.g. `5174`), or you can kill the existing process using `npx kill-port 5173`.
* **Error: `TypeScript compilation errors during build`**
  * *Reason*: Node module version mismatch or strict type check failure.
  * *Fix*: Run `npm run lint` to identify lines causing the warning, or clean modules and reinstall: `rm -rf node_modules package-lock.json && npm install`.

---

## 📖 SECTION 6: HOW TO USE IT
Code guidelines and usage patterns.

### 1. Programmatically Opening the Search Drawer
You can trigger the search modal from any custom button or link:
```typescript
import { useSearch } from '@/store/search'

export default function SearchTrigger() {
  const openSearch = useSearch((s) => s.open)
  return <button onClick={openSearch}>Tafuta Sasa</button>
}
```

### 2. Creating an Order in Supabase Database
Here is how order requests are structured and submitted to the Postgres backend:
```typescript
import { createOrder, type CreateOrderInput } from '@/lib/orders'

const checkoutInput: CreateOrderInput = {
  userId: "user-uuid-1234",
  lines: [
    {
      productId: "p-001",
      slug: "audenic-classic-red",
      name: "Audenic Classic",
      price: 43500, // whole TSh
      image: "https://images.unsplash.com/...",
      color: { name: "Flame Red", hex: "#ff4d1a" },
      quantity: 1
    }
  ],
  shipping: {
    recipient_name: "Mwijay Davie",
    phone: "+255712345678",
    line1: "Plot 45, Mikocheni B",
    city: "Dar es Salaam",
    region: "Dar es Salaam",
    country: "Tanzania"
  },
  paymentMethod: "mpesa",
  customerNote: "Tafadhali piga simu kabla ya kufika."
}

// Submit transaction
const result = await createOrder(checkoutInput)
if (result.ok) {
  console.log("Order placed: ", result.order.order_number)
} else {
  console.error("Order failed: ", result.message)
}
```

### 3. Edge Cases & Errors
* **Empty Cart Checkout**: If a checkout is attempted with `lines.length === 0`, `createOrder` returns `{ ok: false, code: 'EMPTY_CART', message: 'Cart ni tupu.' }` without hitting the DB.
* **Database Connection Loss**: If network timeouts occur during submission, the client returns a structured object allowing the checkout page to preserve the user's state.

---

## 🗄 SECTION 7: DATABASE SCHEMA
Audenic runs on a robust relational Postgres schema.

### Tables Specification

#### 1. Table: `profiles`
Stores customer credentials and preferences (linked to `auth.users`).
* `id` : `uuid` (Primary Key) → Links to `auth.users(id)`
* `email` : `text` (Indexed) → Customer email address
* `full_name` : `text` (Nullable) → First & last name
* `phone` : `text` (Nullable) → Contact number
* `avatar_url` : `text` (Nullable) → Profile photo location
* `marketing_opt_in` : `boolean` (Default: `false`) → Opt-in for updates
* `role` : `text` (Default: `'customer'`) → Check: `'customer'`, `'admin'`, `'staff'`
* `created_at` / `updated_at` : `timestamptz` → Timestamp records

#### 2. Table: `addresses`
Stores delivery details.
* `id` : `uuid` (Primary Key, Default: `gen_random_uuid()`)
* `user_id` : `uuid` (Indexed) → References `profiles(id)`
* `label` : `text` (Default: `'Home'`) → Lebo (e.g. Ofisini, Nyumbani)
* `recipient_name` : `text` → Jina la mpokeaji
* `phone` : `text` → Delivery phone number
* `line1` : `text` → Street name / House number
* `line2` : `text` (Nullable) → Landmarks
* `city` : `text` → Mji (e.g. Dar es Salaam)
* `region` : `text` → Mkoa
* `postal_code` : `text` (Nullable)
* `country` : `text` (Default: `'Tanzania'`)
* `is_default` : `boolean` (Default: `false`) → Primary address

#### 3. Table: `orders`
Header table for checkouts.
* `id` : `uuid` (Primary Key, Default: `gen_random_uuid()`)
* `user_id` : `uuid` (Indexed) → References `profiles(id)`
* `order_number` : `text` (Unique, Indexed) → Friendly ID `AUD-YYYY-NNNNNN`
* `status` : `text` (Default: `'pending'`) → Check: `'pending'`, `'paid'`, `'processing'`, `'shipped'`, `'delivered'`, `'cancelled'`, `'refunded'`
* `subtotal_tsh` : `integer` → Subtotal in TSh
* `shipping_tsh` : `integer` → Shipping fee
* `tax_tsh` : `integer` → Tax fee
* `total_tsh` : `integer` → Total paid
* `payment_method` : `text` (Nullable) → Check: `'mpesa'`, `'tigopesa'`, `'airtel_money'`, `'card'`, `'cod'`
* `payment_reference` : `text` (Nullable) → Mobile Money transaction ID
* `paid_at` : `timestamptz` (Nullable)
* `shipping_address` : `jsonb` → Address snapshot
* `customer_note` : `text` (Nullable)

#### 4. Table: `order_items`
Line items for each order.
* `id` : `uuid` (Primary Key)
* `order_id` : `uuid` (Indexed) → References `orders(id)`
* `product_id` : `text` (Indexed) → References product ID catalog
* `product_slug` : `text` → For routing
* `product_name` : `text` → Product name
* `product_image` : `text`
* `color_name` / `color_hex` : `text` → Selected configuration
* `unit_price_tsh` : `integer`
* `quantity` : `integer`
* `line_total_tsh` : `integer`

---

## 🤖 SECTION 8: AI INTEGRATION DETAILS
Dynamic copy generation and sound tuning descriptors.

The project is structured to optionally query LLMs via the multi-key resilient pool declared in the `.env` configuration (supporting Gemini, Groq, OpenRouter, and Cerebras).

* **Primary Model**: `gemini-2.5-flash` via Google AI Studio API.
* **Why this model**: Low response latency, free-tier quotas (15 RPM / 1M TPM), and excellent translation/Swahili cultural optimization.
* **Prompt Construction**:
  For newsletter copy:
  ```text
  Wewe ni muuzaji mkuu wa bidhaa za sauti Audenic Audio kutoka Dar es Salaam.
  Andika ujumbe mfupi wa kuvutia kwa barua pepe kumkaribisha mteja mpya aliyesajili email: [email].
  Ujumbe uwe na lugha mchanganyiko ya Kiswahili na Kiingereza (Sheng ya Dar), ukitaja bidhaa zetu kuu (Mwanga Buds, Audenic Classic).
  Usiweke maneno mengi ya ki-AI (mfano "Kumbuka kwamba", "Hakika"). Andika kifupi sana na kwa hisia ya muziki mzuri.
  ```
* **Error Mitigation**: The application automatically implements a multi-key rotation array. If a query returns a `429 Rate Limit` or quota error, the client attempts the next key in the comma-separated `GEMINI_KEYS` string.

---

## ⚠️ SECTION 9: CURRENT LIMITATIONS & KNOWN BUGS
Brutally honest roadmap items.

* **Database Constraints**: The database unique constraint on default address (`uniq_addresses_default_per_user`) will raise an error if client-side verification fails to clear existing defaults before marking a new default.
* **Mobile Money Syncs**: The payment flow is currently a mock input form. No direct mobile money USSD push API is connected.
* **Hydration Differences**: The Lenis scroll engine can sometimes conflict with browser page layout heights during rapid SPA route transitions.
* **Security Debt**: Row-Level Security (RLS) is defined, but the anonymized select permissions allow any guest to query the `newsletter_subscribers` table if the exact matching email is passed.

---

## 🎨 SECTION 10: MODIFICATION & ADDON GUIDE
Customizing the Audenic experience.

### Addon A: Swahili/English Language Toggle Switch
* **Difficulty**: ⭐⭐ (2/5)
* **Time**: 4 hours
* **Files to modify**: [Nav.tsx](file:///c:/Users/MWIJAY%20TECH/Desktop/PROJECTS/audenic-audio-premium/src/components/Nav.tsx), [Layout.tsx](file:///c:/Users/MWIJAY%20TECH/Desktop/PROJECTS/audenic-audio-premium/src/components/Layout.tsx)
* **New files to create**: `src/hooks/useLanguage.ts`
* **Guide**: Create a context provider to store active language (`sw` or `en`). Replace static UI text blocks with a translations object dictionary mapping values. Add a layout button in the navbar to switch flags.

### Addon B: User Profile Avatar Uploads
* **Difficulty**: ⭐⭐⭐ (3/5)
* **Time**: 8 hours
* **Files to modify**: [Account.tsx](file:///c:/Users/MWIJAY%20TECH/Desktop/PROJECTS/audenic-audio-premium/src/pages/Account.tsx)
* **Dependencies**: none (`@supabase/supabase-js` is already installed)
* **Guide**: Add a file picker input on the Profile tab. On select, write the file to the `avatars` bucket via `supabase.storage.from('avatars').upload(...)`. Save the resulting URL link to the profiles row.

---

## 🌐 SECTION 11: DEPLOYMENT GUIDE
Go live with your Audenic store.

### 1. Deploying to Netlify / Vercel
1. Set up your build settings on the hosting dashboard:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
2. Add your environment variables in the project settings:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
3. Hit Deploy.

### 2. Postgres RLS Deployment
Ensure you push database tables and RLS rules to your Supabase instance:
```bash
# Run schema and security settings in the SQL editor
psql -h your-db-host -U postgres -f supabase/schema.sql
psql -h your-db-host -U postgres -f supabase/rls.sql
```

---

## 📊 SECTION 12: COST CALCULATOR
Estimate running costs.

| Service | Free Tier | Paid Tier | Cost at 100 users | Cost at 1000 users |
|---|---|---|---|---|
| **Supabase** | DB (500MB), Auth, Storage (1GB) | $25 / month | $0 (Free tier covers this) | $0 (Free tier covers this) |
| **Hosting (Vercel)** | Full SPA Hosting, bandwidth | $20 / month | $0 | $0 |
| **Gemini API** | 15 RPM / 1M TPM free limits | Pay-as-you-go | $0 | $0 |
| **Total** | | | **$0 / month** | **$0 / month** |

---

## 🗺️ SECTION 13: ROADMAP
Where Audenic goes next.

### Short Term (2 Weeks)
* [ ] Fix Lenis route transition jumping.
* [ ] Connect a mockup payment checkout notification receipt email via resend API.
* [ ] Add a visual equalizer animation to the product pages.
* [ ] Improve fuzzy matching logic in search results.
* [ ] Cache product details locally in Zustand for instant detail page loading.

### Medium Term (3 Months)
* [ ] Implement full checkout integrations with local mobile money providers.
* [ ] Create a dashboard panel for administrative stock tracking.

### Long Term (6–12 Months)
* [ ] Introduce custom sound profile configuration uploads.
* [ ] Launch native iOS/Android client apps using Capacitor or React Native.

---

## 💡 SECTION 14: LESSONS LEARNED
Takeaways from building Audenic.

* **Animation Coordination**: Relying on GSAP for page scroll triggers and Framer Motion for page route layouts requires careful hook design to avoid page-height miscalculations. Always initialize Lenis *after* the DOM has finished mounting.
* **Database fallback design**: Building a solid mock client-side offline store means the UI can be showcased in developer meetings without needing live cloud endpoints.
* **Color preservation**: Editorial and DTC websites stand out when they avoid boring generic dark modes and stick to clean, high-contrast, specific design brand colors.

---

## 📇 SECTION 15: QUICK REFERENCE CARD
Your cheat sheet for development.

### Development Commands
```bash
# Run local Vite web app dev server
npm run dev

# Run TypeScript typechecks
npm run lint

# Compile production-ready assets to /dist
npm run build
```

### Essential Paths
* Database Setup SQL script: `supabase/schema.sql`
* Database RLS Rules script: `supabase/rls.sql`
* Products Catalog: `src/data/products.ts`
* Supabase Client Singleton: `src/lib/supabase.ts`

### Quick Fixes
* **Missing DB Connection**: Clear local session cache by clearing site storage `audenic-auth` in browser developer tools console to return to clean guest state.
