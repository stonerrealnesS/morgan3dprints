# Morgan 3D Prints - Project Summary
**Synthesized:** April 2026 | **For:** Solo developer pre-planning

---

## Stack (confirmed + changes)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15.3.x (App Router) | No changes. Do NOT use output: export. |
| Styling | Tailwind CSS v4 + Framer Motion v12 | CSS-first config via @import tailwindcss, no tailwind.config.js. |
| Database ORM | Prisma 6.x + PostgreSQL | Do NOT use Prisma 7 - ESM-only breaking changes, still unstable. |
| Auth | Clerk v6 | Validated. Better Auth viable if data ownership is a concern. |
| Payments | Stripe (Checkout Sessions + Webhooks) | Use hosted Checkout + allow_promotion_codes: true instead of custom UI. |
| Images | Cloudinary + next-cloudinary | Beats Uploadthing/Supabase Storage for catalog-scale transformations. |
| Email | Resend + React Email | 3,000/mo free, React JSX templates. Avoid SendGrid. |
| Hosting | Hostinger KVM VPS (not managed) | Managed hosting blocks persistent storage, crons, WebSockets. VPS ~5-7 USD/mo. |
| State (cart) | Zustand v5 | Simpler than Redux for this scope. |
| Validation | Zod + react-hook-form | Pair everywhere: forms and Server Actions. |
| DB hosting | Neon (serverless Postgres) | Free tier generous; use if not running Postgres locally on VPS. |
| Shipping | Shippo | Free for 30 labels/mo; real-time USPS/UPS rates. USPS default for items under 5 lbs. |

---

## Key Features (beyond the confirmed list)

These were not in the original brief but are required for launch or high-ROI shortly after:

- **Age gate for adult/cannabis categories** - Session cookie after 18+ click-through; exclude from XML sitemap. Legal and policy requirement.
- **Discreet packaging checkbox at checkout** - Standard for adult product retailers.
- **Guest checkout as default path** - Requiring account creation causes 24% cart abandonment.
- **Surprise-free shipping cost display** - Show estimated shipping from the cart page; surprise costs are the #1 abandonment cause (55%).
- **Progress indicator at checkout** - Reduces abandonment by setting step expectations.
- **Made-to-order vs In-stock labeling per product** - Prevents customers expecting 2-day shipping on printed-to-order items.
- **Glow-in-the-dark video or GIF on product pages** - A 5-second clip outperforms any written description for these SKUs.
- **Print material callout on every product** - e.g. Printed in PETG: durable, flexible, heat-resistant. Differentiates from generic stores.
- **Admin bulk order status updates** - Without this, marking 20 orders as shipped becomes painful fast.
- **Admin order search + status filter tabs** - Essential once orders exceed ~200.
- **Audit log for admin actions** - Simple AdminAction table; critical for dispute resolution.
- **Product schema JSON-LD** - Enables Google Shopping rich results; 20-30% higher CTR.
- **Local SEO: Google Business Profile** - Not on the site itself, but critical for 3D printing OKC searches.
- **Low stock threshold alerts to admin** - Email/dashboard alert when inventory drops below a configurable threshold.
- **Order notes (admin-only field)** - For notes like customer wants red variant.
- **Abandoned cart recovery emails (v2)** - 70% abandonment rate; recovery emails convert at 50%.

---

## Architecture Decisions

1. **Route groups for section isolation** - (shop), (account), (admin), (auth) each get their own layout without URL impact; single codebase, no separate admin app.
2. **Server Components by default, use client only at leaf level** - AddToCartButton, ImageGallery etc. are client; product data fetching stays server-side to keep bundles small.
3. **generateStaticParams + ISR for all product pages** - Pre-render all 111 product pages at build time; use revalidatePath/revalidateTag from admin save actions for on-demand refresh.
4. **Order fulfillment only via Stripe webhook, never via success URL** - Success page is display-only; all DB writes, inventory updates, and emails happen inside checkout.session.completed handler.
5. **Prices stored as cents (integers) throughout** - No floating-point bugs; Stripe expects cents natively.
6. **Snapshot critical fields at purchase time** - OrderItem copies productName, unitPrice, imageUrl; Order.shippingAddress is a JSON snapshot; historical orders stay accurate as products change.
7. **Defense-in-depth for admin auth** - Middleware redirects unauthenticated users (UX), but every admin Server Component and Server Action independently checks role via auth() (actual security gate). CVE-2025-29927 makes middleware-only protection exploitable.
8. **Signed Cloudinary uploads only** - Client requests signature from /api/cloudinary/sign; never expose CLOUDINARY_API_SECRET or use unsigned presets in admin.

---

## Top 10 Pitfalls to Avoid

Ranked by severity (revenue loss / security risk first):

| # | Pitfall | Prevention |
|---|---|---|
| 1 | **Client-submitted prices at checkout** | Server always looks up price from DB by product ID; never accept price from request body. |
| 2 | **Stripe webhook signature not verified** | Use await req.text() (raw body) + stripe.webhooks.constructEvent(); return 400 on failure. |
| 3 | **Non-idempotent webhook handler** | Store event.id with a unique constraint; check before processing to prevent duplicate orders. |
| 4 | **CVE-2025-29927 middleware bypass** | Use Next.js 15.2.3+; add server-side auth() + role check in every admin Server Component and Server Action - never middleware alone. |
| 5 | **Order fulfilled via success URL redirect** | Success page is display-only; all fulfillment logic lives in the webhook handler. |
| 6 | **Prisma connection pool exhaustion** | Use the singleton pattern in lib/prisma.ts from day one; never instantiate PrismaClient outside it. |
| 7 | **prisma migrate dev in production** | Deployment scripts use npx prisma migrate deploy only; migrate dev can reset data. |
| 8 | **NEXT_PUBLIC_ vars not set at build time** | These are inlined at build - set all NEXT_PUBLIC_ vars in Hostinger before triggering deploy, not just at runtime. |
| 9 | **Admin route protection via middleware only** | Server Actions are callable outside the middleware path; guard every mutation with auth() + role check individually. |
| 10 | **Deploying on Hostinger managed hosting** | Use KVM VPS from day one; managed hosting blocks persistent storage, crons, and WebSockets. |

**Also watch for:** Not setting remotePatterns for Cloudinary in next.config.ts (images fail to optimize); calling auth() in root layout (forces every page dynamic); missing priority prop on hero product image (tanks LCP); missing DB indexes on Order.status, Order.createdAt, clerkUserId (queries degrade as data grows).

---

## Build Order

### Phase 1 - Foundation
Scaffold Next.js 15 + TypeScript + Tailwind v4. Write Prisma schema + first migration + seed data. Configure Clerk (provider, middleware, Clerk-to-Customer sync webhook). Prisma singleton. Local Docker Postgres dev + Neon for prod.

### Phase 2 - Storefront Core
Product listing (ISR), product detail (static generation), category pages. Responsive header/footer/mobile nav. Homepage with featured products.

### Phase 3 - Cart and Checkout
Zustand cart state. Stripe Checkout Session via Server Action. Checkout success page. Stripe webhook handler -> order creation -> Resend confirmation email. Order history page.

### Phase 4 - Admin Dashboard
Admin route protection (middleware + layout guard + per-action auth checks). Product CRUD with Cloudinary signed uploads. Category and discount code management. Order management with status workflow and bulk actions. Basic dashboard (pending orders, low stock alerts, recent orders).

### Phase 5 - Enhanced Features
Customer reviews (submit, photo upload, admin moderation). Custom order request form + admin quote workflow + email notifications. Discount code application at checkout. On-demand cache revalidation wired to all admin saves. Age gate for adult/cannabis categories.

### Phase 6 - Polish and Launch
generateMetadata on all product/category pages. Product schema JSON-LD. error.tsx, not-found.tsx, loading.tsx skeletons. Email template design. Env variable audit. Stripe webhook URL updated to production. Core Web Vitals audit (LCP < 2.5s, WebP images, priority on hero images). PM2 + UptimeRobot monitoring on VPS.
