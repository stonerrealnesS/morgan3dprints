# Morgan 3D Prints — Roadmap

## Overview

6 phases | 46 v1 requirements | Build a fully custom neon-themed 3D printing e-commerce store from scaffold to live production, covering catalog, checkout, admin, enhanced features, and launch hardening.

---

## Phase Summary

| # | Phase | Goal | REQ-IDs | UI Hint |
|---|-------|------|---------|---------|
| 1 | Foundation | Deploy a working Next.js app with database, auth, and neon design system to the VPS | UX-01, UX-02, AUTH-01, AUTH-02, AUTH-03 | Yes |
| 2 | Storefront | Browse, search, and view products so customers can discover what they want to buy | CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06, UX-03, UX-04, SEO-04, SEO-05 | Yes |
| 3 | Cart & Checkout | Complete a real purchase end-to-end including payment, compliance, and confirmation email | CART-01, CART-02, CART-03, CART-04, CART-05, CART-06, CART-07, CART-08, COMP-01, COMP-02, COMP-03, EMAIL-01, EMAIL-02 | Yes |
| 4 | Admin Dashboard | Manage products, orders, images, categories, and discount codes without touching code | ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07, ADM-08, ADM-09, ADM-10, ADM-11 | Yes |
| 5 | Enhanced Features | Log in to see order history, leave reviews, and submit custom/Print-by-the-Hour requests | AUTH-04, AUTH-05, REV-01, REV-02, CUSTOM-01, CUSTOM-02, CUSTOM-03, EMAIL-03 | Yes |
| 6 | Polish & Launch | Ship to production with full SEO metadata, optimized performance, migrated products, and monitoring | SEO-01, SEO-02, SEO-03 | No |

---

## Phase Details

### Phase 1: Foundation

**Goal:** A running Next.js 15 app with the neon design system, PostgreSQL schema, Clerk auth, and a working deployment on the Hostinger VPS — every later phase builds on this.
**UI Hint:** Yes

**Requirements:** UX-01, UX-02, AUTH-01, AUTH-02, AUTH-03

**Key Deliverables:**
- Next.js 15 project scaffold (App Router, TypeScript, Tailwind v4, Framer Motion)
- Global neon dark theme — CSS variables, color palette (dark bg, electric purple/cyan/pink), glow utility classes
- Prisma 6 schema + first migration: Product, Category, Order, OrderItem, Customer, Review, CustomRequest, DiscountCode, AdminAction tables; prices stored as cents; DB indexes on Order.status, Order.createdAt, clerkUserId
- `lib/prisma.ts` singleton to prevent connection pool exhaustion
- Clerk v6 integration: provider, middleware, Clerk-to-Customer sync webhook (`/api/webhooks/clerk`)
- Hostinger KVM VPS provisioned: Node.js runtime, PM2 process manager, Neon PostgreSQL connection, environment variables set at build time
- Base layout: `(shop)`, `(account)`, `(admin)`, `(auth)` route groups with shared shell
- `error.tsx`, `not-found.tsx`, `loading.tsx` placeholder shells
- Mobile-responsive layout skeleton

**Success Criteria:**
1. Visiting the deployed domain shows the neon dark homepage shell with no console errors and a Lighthouse mobile score above 90 for the empty page.
2. Signing up, logging in, and logging out via Clerk all work end-to-end; a Customer row is created in the database on first sign-in.
3. Running `npx prisma migrate deploy` on the VPS succeeds cleanly and all tables exist in Neon.
4. The app restarts automatically via PM2 after a simulated crash with no manual intervention.
5. Navigating to a non-existent route renders the custom `not-found.tsx` page.

---

### Phase 2: Storefront

**Goal:** Customers can browse the full catalog, filter by category, search by keyword, and view a complete product detail page — the store is shoppable without a cart.
**UI Hint:** Yes

**Requirements:** CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06, UX-03, UX-04, SEO-04, SEO-05

**Key Deliverables:**
- Homepage: hero section, featured products grid, category highlights (`/`)
- Paginated product catalog page (`/shop`) with category filter sidebar/tabs and keyword search bar
- Category pages (`/shop/[category]`) with filtered product grids
- Product detail page (`/shop/[category]/[slug]`): image gallery (Cloudinary WebP), description, price, material callout, glow-in-the-dark badge, in-stock vs. made-to-order label
- `generateStaticParams` + ISR (`revalidate = 3600`) on all product and category pages
- Responsive header with search input, cart icon with item count badge, and account menu (Clerk `<UserButton>`)
- Responsive footer with trust badges (Made in USA, Ships Nationwide)
- Cloudinary `next-cloudinary` integration with `remotePatterns` in `next.config.ts`; all product images served as WebP via Cloudinary transformations
- Seed script populating categories and a representative set of sample products for development

**Success Criteria:**
1. All 111 product slugs return HTTP 200 with no runtime errors; static HTML is pre-rendered at build time and confirmed via `curl -I` (no `x-nextjs-cache: MISS` on first hit after build).
2. Filtering by any category shows only products from that category; searching "keychain" returns only matching products within 500 ms.
3. A product detail page displays at least one image in WebP format (confirmed via browser DevTools Network tab), the correct price, material callout, and stock status label.
4. Navigating the site on a 375 px wide viewport (iPhone SE) shows no horizontal scroll and all text is legible without zoom.
5. The homepage, catalog, and product detail pages each render with the neon theme — dark background, glowing card borders, electric accent headings.

---

### Phase 3: Cart & Checkout

**Goal:** A customer can add items to a cart, apply a discount code, choose pickup or shipping, complete payment via Stripe, and receive an order confirmation email — including full compliance (age gate, discreet packaging).
**UI Hint:** Yes

**Requirements:** CART-01, CART-02, CART-03, CART-04, CART-05, CART-06, CART-07, CART-08, COMP-01, COMP-02, COMP-03, EMAIL-01, EMAIL-02

**Key Deliverables:**
- Zustand v5 cart store: add, remove, update quantity, persist to `localStorage`
- Cart drawer/page: item list with quantity controls, running total, estimated shipping display, and discreet packaging checkbox (COMP-02)
- Age gate modal: session-cookie-based 18+ click-through; blocks access to adult/cannabis category pages and their product detail pages (COMP-01)
- Checkout flow: pickup vs. shipping selector (CART-03), guest checkout path (CART-04), discount code input field (CART-05)
- `POST /api/checkout` Server Action: looks up prices from DB (never trusts client price), creates Stripe Checkout Session with `allow_promotion_codes: true`, appends `discreet_packaging` metadata
- Stripe Checkout Session hosted by Stripe; redirect to order confirmation on success
- Order confirmation page (`/order/[orderId]/confirmation`): display-only, populated from DB (CART-07)
- `POST /api/webhooks/stripe` handler: verifies signature with raw body, checks event ID for idempotency, writes Order + OrderItems (price snapshot), decrements inventory, triggers Resend emails — all inside `checkout.session.completed`
- Resend + React Email: order confirmation email template (EMAIL-01) and shipping notification email template (EMAIL-02); shipping email sent when order status changes to `shipped`
- Made-in-USA and ships-nationwide trust badges visible on cart and checkout pages (COMP-03)

**Success Criteria:**
1. Adding three products, updating a quantity, and removing one item all reflect correctly in the cart total with no page reload; cart persists after browser refresh.
2. Attempting to access an adult-category URL without clicking through the age gate redirects to the age gate; clicking "I am 18+" sets a session cookie and grants access.
3. Completing a Stripe test checkout (card `4242 4242 4242 4242`) creates an Order row in the database, decrements product stock, and sends an order confirmation email to the test address — all triggered by the webhook, not the redirect.
4. Applying a valid discount code at the Stripe Checkout step reduces the total by the correct amount.
5. The Stripe webhook handler returns 400 for a request with an invalid signature and 200 (idempotent no-op) for a duplicate event ID.

---

### Phase 4: Admin Dashboard

**Goal:** The store owner can add, edit, and delete products with drag-and-drop image uploads, manage all orders through their full lifecycle, and administer discount codes and categories — all from a protected dashboard.
**UI Hint:** Yes

**Requirements:** ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07, ADM-08, ADM-09, ADM-10, ADM-11

**Key Deliverables:**
- Admin route group `(admin)` with layout guard: middleware redirect + independent `auth()` + role check in every Server Component and Server Action (defense-in-depth per CVE-2025-29927)
- Admin dashboard overview: pending order count, low-stock alerts, recent orders list
- Product management: create/edit form (name, description, price in cents, category, material, stock status, glow badge toggle), delete with confirmation; `revalidatePath`/`revalidateTag` on every save to trigger ISR refresh
- Cloudinary signed image upload: `/api/cloudinary/sign` returns a short-lived signature; client-side drag-and-drop uploader calls Cloudinary directly; API secret never exposed to client (ADM-04)
- Category management: add, rename, delete categories; delete blocked if products exist in category (ADM-05)
- Discount code management: create percent or fixed codes with optional expiry date and usage limit; view active/expired codes; disable codes (ADM-06)
- Order management table: sortable by date/status, filterable by status tab, searchable by customer name/order ID (ADM-07)
- Order detail view: full item list, customer info, shipping address snapshot, order notes field (ADM-09)
- Order status workflow: pending → processing → shipped → delivered; cancelled at any stage; single-update and bulk-update (ADM-08, ADM-11); marking shipped triggers shipping notification email (EMAIL-02)
- Custom order inbox: view all custom request submissions, mark as reviewed, reply field for admin notes (ADM-10)
- AdminAction audit log: every product create/edit/delete and order status change writes a row to the AdminAction table

**Success Criteria:**
1. Creating a new product via the admin form, uploading two images via drag-and-drop, and saving causes that product to appear on the live storefront within 60 seconds (ISR on-demand revalidation confirmed).
2. Accessing any admin URL while logged out redirects to the sign-in page; accessing any admin Server Action directly (simulated via `fetch`) without a valid admin session returns a 401/403 error — middleware bypass does not grant access.
3. Bulk-selecting 10 orders and updating status to "shipped" updates all 10 rows in one operation and triggers 10 shipping notification emails.
4. Creating a discount code with a 2-use limit and applying it twice at checkout consumes both uses; a third attempt at checkout rejects the code.
5. Every product save, delete, and order status change creates a corresponding row in the AdminAction table with the acting admin's Clerk user ID and a timestamp.

---

### Phase 5: Enhanced Features

**Goal:** Logged-in customers can view their order history, manage saved addresses, leave product reviews, and submit custom or Print-by-the-Hour requests that trigger confirmation emails.
**UI Hint:** Yes

**Requirements:** AUTH-04, AUTH-05, REV-01, REV-02, CUSTOM-01, CUSTOM-02, CUSTOM-03, EMAIL-03

**Key Deliverables:**
- Account dashboard (`/account`): order history list with status badges and link to order detail (AUTH-04)
- Saved addresses management: add, edit, delete shipping addresses; pre-fill at checkout for logged-in users (AUTH-05)
- Product review form: star rating (1–5) + text body; only visible to logged-in users; one review per user per product enforced at DB level (REV-01)
- Review display on product detail page: individual reviews list + computed average rating with star display (REV-02)
- "Print by the Hour" request form (`/services/print-by-the-hour`): STL/OBJ/3MF file upload via Cloudinary, filament color/material selection, estimated hours, contact info, notes (CUSTOM-01)
- Custom order request form (`/services/custom-order`): description textarea, reference image uploads, name, email, phone (CUSTOM-02)
- Both forms submit to Server Actions that write to the CustomRequest table and send a Resend acknowledgement email to the customer (CUSTOM-03, EMAIL-03)
- Admin custom order inbox (ADM-10) wired to custom request submissions from this phase
- On-demand ISR cache revalidation triggered from all admin product save actions (wires `revalidateTag` end-to-end)

**Success Criteria:**
1. A logged-in customer who completed an order sees that order in `/account` with the correct status, items, and total; a guest who placed an order does not see it after creating a new account.
2. Submitting a review on a product page persists the review and updates the average star rating on the product detail page without a full rebuild.
3. Submitting a Print-by-the-Hour request with an attached STL file stores the Cloudinary URL in the database and sends a confirmation email to the submitted address within 60 seconds.
4. Attempting to leave a second review on the same product as the same logged-in user is blocked with a clear error message.
5. A saved shipping address pre-fills the address fields at checkout for the logged-in user on their next purchase.

---

### Phase 6: Polish & Launch

**Goal:** The site is live on the production domain with all 111 products migrated, full SEO metadata and structured data, Core Web Vitals passing, and production monitoring active.
**UI Hint:** No

**Requirements:** SEO-01, SEO-02, SEO-03

**Key Deliverables:**
- `generateMetadata` on every product page (SEO-01): editable meta title and description sourced from product DB fields
- Product JSON-LD schema markup on every product detail page: `Product` type with `name`, `description`, `offers` (price, currency, availability), `aggregateRating` (SEO-02)
- `sitemap.xml` generated dynamically via Next.js `sitemap.ts`; adult/cannabis category URLs excluded from sitemap (COMP-01 cross-concern); `robots.txt` blocking admin routes (SEO-03)
- Data migration script: parse old-site product data (CSV/JSON export), map to new Prisma schema, upload images to Cloudinary, insert all 111 products with correct categories and slugs
- Email template visual polish: React Email templates for order confirmation, shipping notification, and custom order acknowledgement styled to match neon brand
- Environment variable audit: all `NEXT_PUBLIC_` vars confirmed set in Hostinger before build; all secrets confirmed server-side only
- Stripe webhook URL updated to production domain in Stripe dashboard
- Core Web Vitals audit: LCP < 2.5 s, hero image has `priority` prop, all product images WebP via Cloudinary, `loading="lazy"` on below-fold images
- PM2 ecosystem config with auto-restart; UptimeRobot monitor on production domain with email alert to owner
- Final QA pass: run through full purchase flow, admin flow, custom order flow, and account flow on production with real Stripe test card

**Success Criteria:**
1. All 111 product pages return HTTP 200 on the production domain, each with a unique `<title>` and `<meta name="description">` tag sourced from the database.
2. Pasting a product URL into Google's Rich Results Test shows a valid `Product` schema with price and availability; no errors reported.
3. `sitemap.xml` is accessible at `/sitemap.xml`, contains all non-adult product URLs, and excludes `/admin/*`; `robots.txt` at `/robots.txt` disallows `/admin`.
4. A Lighthouse run on the production homepage and a product detail page each score LCP < 2.5 s with no "Avoid enormous network payloads" warnings for images.
5. Killing the Node process on the VPS causes PM2 to restart it within 5 seconds; UptimeRobot sends a downtime alert email within 2 minutes of the simulated outage.

---

## Requirement Coverage

All 46 v1 requirements accounted for:

| REQ Group | Phase |
|-----------|-------|
| UX-01, UX-02 | Phase 1 |
| AUTH-01, AUTH-02, AUTH-03 | Phase 1 |
| CAT-01–CAT-06 | Phase 2 |
| UX-03, UX-04 | Phase 2 |
| SEO-04, SEO-05 | Phase 2 |
| CART-01–CART-08 | Phase 3 |
| COMP-01–COMP-03 | Phase 3 |
| EMAIL-01, EMAIL-02 | Phase 3 |
| ADM-01–ADM-11 | Phase 4 |
| AUTH-04, AUTH-05 | Phase 5 |
| REV-01, REV-02 | Phase 5 |
| CUSTOM-01–CUSTOM-03 | Phase 5 |
| EMAIL-03 | Phase 5 |
| SEO-01–SEO-03 | Phase 6 |
