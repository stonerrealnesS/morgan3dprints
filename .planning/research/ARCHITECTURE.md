# Morgan 3D Prints — Architecture Research

**Stack:** Next.js 15 (App Router) · PostgreSQL · Prisma ORM · Clerk Auth · Stripe · Cloudinary · Resend Email · Hostinger
**Researched:** April 2026

---

## 1. Project Structure

### Top-Level Layout

```
morgan-3d-prints/
├── src/
│   ├── app/                    # All routes (App Router)
│   ├── components/             # Shared UI components
│   ├── lib/                    # External service clients, business logic
│   ├── utils/                  # Pure helper functions (no side effects)
│   ├── hooks/                  # Custom React hooks (client-side)
│   ├── types/                  # Shared TypeScript types/interfaces
│   └── styles/                 # Global CSS / Tailwind config
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/                     # Static assets
├── middleware.ts               # Clerk auth middleware (root level)
├── next.config.ts
└── .env.local
```

> Use a `src/` directory to cleanly separate application code from configuration files. This is the consensus 2025 pattern for production Next.js apps.

---

### App Router — Route Organization

Use **route groups** (folders in parentheses) to create logical sections with their own layouts without affecting URLs.

```
src/app/
├── layout.tsx                      # Root layout — ClerkProvider, fonts
├── page.tsx                        # Homepage (/)
│
├── (shop)/                         # Customer-facing storefront
│   ├── layout.tsx                  # Shop layout: header, nav, footer
│   ├── products/
│   │   ├── page.tsx                # /products — product listing
│   │   └── [slug]/
│   │       └── page.tsx            # /products/[slug] — product detail
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx            # /categories/[slug]
│   ├── cart/
│   │   └── page.tsx                # /cart
│   ├── checkout/
│   │   ├── page.tsx                # /checkout
│   │   └── success/page.tsx        # /checkout/success
│   └── custom-orders/
│       └── page.tsx                # /custom-orders — custom request form
│
├── (account)/                      # Authenticated customer area
│   ├── layout.tsx                  # Account layout (requires Clerk auth)
│   ├── orders/
│   │   ├── page.tsx                # /orders — order history
│   │   └── [id]/page.tsx           # /orders/[id] — order detail
│   └── profile/
│       └── page.tsx                # /profile
│
├── (auth)/                         # Clerk auth pages
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx
│   └── sign-up/[[...sign-up]]/
│       └── page.tsx
│
├── (admin)/                        # Admin dashboard — same app, protected
│   ├── layout.tsx                  # Admin layout: sidebar, admin nav
│   ├── admin/
│   │   ├── page.tsx                # /admin — dashboard overview
│   │   ├── products/
│   │   │   ├── page.tsx            # Product list
│   │   │   ├── new/page.tsx        # Create product
│   │   │   └── [id]/
│   │   │       └── edit/page.tsx   # Edit product
│   │   ├── orders/
│   │   │   ├── page.tsx            # Order management
│   │   │   └── [id]/page.tsx       # Order detail / status update
│   │   ├── customers/
│   │   │   └── page.tsx
│   │   ├── custom-requests/
│   │   │   └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   └── discounts/
│   │       └── page.tsx
│
└── api/                            # Route Handlers (external consumers only)
    ├── webhooks/
    │   └── stripe/
    │       └── route.ts            # Stripe webhook handler
    └── cloudinary/
        └── sign/
            └── route.ts            # Cloudinary signed upload params
```

### Component Organization

```
src/components/
├── ui/                   # Headless / shadcn-ui primitives (Button, Card, Input…)
├── layout/               # Header, Footer, Sidebar, MobileNav
├── shop/                 # ProductCard, ProductGrid, CartItem, PriceDisplay
├── admin/                # DataTable, ImageUploader, OrderStatusBadge
├── forms/                # CheckoutForm, CustomOrderForm, ReviewForm
└── shared/               # LoadingSpinner, EmptyState, ErrorBoundary
```

### Lib / Utils

```
src/lib/
├── prisma.ts             # Prisma client singleton
├── stripe.ts             # Stripe client singleton
├── cloudinary.ts         # Cloudinary SDK config
├── resend.ts             # Resend email client
├── auth.ts               # Clerk helper wrappers (getCurrentUser, requireAdmin)
└── email-templates/      # React Email templates for order confirmation, etc.

src/utils/
├── currency.ts           # formatPrice(), parseCents()
├── slug.ts               # generateSlug()
├── validators.ts         # Zod schemas for form/API validation
└── cn.ts                 # clsx + tailwind-merge utility
```

---

## 2. Database Schema Outline

Full Prisma schema for PostgreSQL. Use `cuid()` for IDs (URL-safe, sortable). Timestamps on every model.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// CATALOG
// ─────────────────────────────────────────────

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?
  parentId    String?
  parent      Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id            String      @id @default(cuid())
  name          String
  slug          String      @unique
  description   String
  price         Int         // stored in cents (e.g. 1999 = $19.99)
  comparePrice  Int?        // original price for sale display
  categoryId    String
  category      Category    @relation(fields: [categoryId], references: [id])
  images        ProductImage[]
  inventory     Int         @default(0)
  isActive      Boolean     @default(true)
  isFeatured    Boolean     @default(false)
  material      String?     // e.g. "PLA", "PETG", "Resin"
  printTime     Int?        // estimated print hours
  weight        Float?      // grams
  dimensions    Json?       // { width, height, depth } in mm
  tags          String[]
  orderItems    OrderItem[]
  reviews       Review[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model ProductImage {
  id           String   @id @default(cuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url          String
  cloudinaryId String   // store public_id for transformations/deletions
  altText      String?
  position     Int      @default(0)
  createdAt    DateTime @default(now())
}

// ─────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────

model Customer {
  id          String    @id @default(cuid())
  clerkUserId String    @unique   // Clerk user ID — the source of truth for auth
  email       String    @unique
  firstName   String?
  lastName    String?
  phone       String?
  stripeId    String?   @unique   // Stripe customer ID for payment methods
  addresses   Address[]
  orders      Order[]
  reviews     Review[]
  customRequests CustomOrderRequest[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Address {
  id         String   @id @default(cuid())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  line1      String
  line2      String?
  city       String
  state      String
  zip        String
  country    String   @default("US")
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────

enum OrderStatus {
  PENDING
  PAYMENT_RECEIVED
  PROCESSING
  PRINTING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

model Order {
  id                String      @id @default(cuid())
  orderNumber       String      @unique @default(cuid()) // human-readable ref
  customerId        String
  customer          Customer    @relation(fields: [customerId], references: [id])
  items             OrderItem[]
  subtotal          Int         // cents
  discountAmount    Int         @default(0) // cents
  shippingAmount    Int         @default(0) // cents
  taxAmount         Int         @default(0) // cents
  total             Int         // cents
  status            OrderStatus @default(PENDING)
  shippingAddress   Json        // snapshot at time of order
  stripeSessionId   String?     @unique
  stripePaymentIntentId String? @unique
  discountCodeId    String?
  discountCode      DiscountCode? @relation(fields: [discountCodeId], references: [id])
  trackingNumber    String?
  trackingCarrier   String?
  notes             String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model OrderItem {
  id           String   @id @default(cuid())
  orderId      String
  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  productName  String   // snapshot in case product changes
  productSlug  String
  imageUrl     String?
  quantity     Int
  unitPrice    Int      // cents — snapshot at purchase time
  total        Int      // cents
  createdAt    DateTime @default(now())
}

// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────

model Review {
  id         String   @id @default(cuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
  rating     Int      // 1-5
  title      String?
  body       String?
  isVerified Boolean  @default(false) // verified purchase
  isApproved Boolean  @default(false) // admin moderation
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([productId, customerId]) // one review per product per customer
}

// ─────────────────────────────────────────────
// DISCOUNTS
// ─────────────────────────────────────────────

enum DiscountType {
  PERCENTAGE  // e.g. 20% off
  FIXED       // e.g. $10 off
  FREE_SHIPPING
}

model DiscountCode {
  id            String       @id @default(cuid())
  code          String       @unique
  type          DiscountType
  value         Int          // percentage (20 = 20%) or cents (1000 = $10)
  minOrderValue Int?         // minimum subtotal in cents to apply
  maxUses       Int?         // null = unlimited
  usedCount     Int          @default(0)
  isActive      Boolean      @default(true)
  expiresAt     DateTime?
  orders        Order[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

// ─────────────────────────────────────────────
// CUSTOM ORDER REQUESTS
// ─────────────────────────────────────────────

enum CustomRequestStatus {
  SUBMITTED
  REVIEWING
  QUOTED
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  DECLINED
}

model CustomOrderRequest {
  id            String              @id @default(cuid())
  customerId    String?
  customer      Customer?           @relation(fields: [customerId], references: [id])
  // Allow guest requests too
  guestEmail    String?
  guestName     String?
  title         String
  description   String
  referenceUrls String[]            // links to inspiration/models
  attachments   Json?               // Cloudinary URLs of uploaded files/images
  quantity      Int                 @default(1)
  material      String?
  color         String?
  deadline      DateTime?
  budgetRange   String?             // e.g. "$50–$100"
  status        CustomRequestStatus @default(SUBMITTED)
  quotedPrice   Int?                // admin sets this in cents
  adminNotes    String?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}
```

### Schema Notes

- **Prices in cents** — always store money as integers (cents) to avoid floating-point bugs.
- **Snapshot fields** — `OrderItem` copies `productName`, `unitPrice`, and `imageUrl` at purchase time so historical orders remain accurate if products change.
- **Address snapshot** — `Order.shippingAddress` stores a JSON snapshot so changing an address later doesn't corrupt old orders.
- **`clerkUserId`** — the `Customer` table maps Clerk's user ID to your DB. Create the row on first sign-in via a Clerk webhook (`user.created` event) or lazily on first order.
- **Self-referencing Category** — supports a two-level hierarchy (parent categories → subcategories) without over-engineering.

---

## 3. Key Integration Patterns

### 3a. Stripe Webhooks

**Route:** `src/app/api/webhooks/stripe/route.ts`

Stripe webhooks must be a **Route Handler** (not a Server Action) because they are called by an external system, not your React tree.

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();           // MUST use .text() — not .json()
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case 'charge.refunded':
      await handleRefund(event.data.object as Stripe.Charge);
      break;
  }

  return new Response('OK', { status: 200 });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Idempotency check — prevent duplicate fulfillment
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing?.status !== 'PENDING') return;

  await prisma.order.update({
    where: { stripeSessionId: session.id },
    data: { status: 'PAYMENT_RECEIVED' },
  });
  // Trigger Resend order confirmation email here
}
```

**Events to handle for this store:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Mark order PAYMENT_RECEIVED, send confirmation email |
| `payment_intent.payment_failed` | Mark order FAILED, notify customer |
| `charge.refunded` | Mark order REFUNDED, update inventory |
| `payment_intent.succeeded` | Optional fallback for direct payment intents |

**Critical rules:**
- Use `await req.text()` — parsed JSON breaks Stripe's signature verification.
- Always check for existing records before processing (idempotency).
- Return HTTP 200 quickly; do heavy work asynchronously or with a queue if needed.
- For Hostinger: ensure the webhook URL is publicly accessible. Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` during development.

**Disable body parsing for the webhook route** — in Next.js 15 App Router this is the default behavior for Route Handlers, so no extra config needed (unlike Pages Router which required `export const config = { api: { bodyParser: false } }`).

---

### 3b. Admin Dashboard — Same App, Protected Routes

**Decision: Keep admin inside the same Next.js app using the `(admin)` route group.** Separate apps add deployment complexity without meaningful security benefit when using middleware-based protection. Route groups give admin its own layout (sidebar, different nav) while keeping a single codebase and shared Prisma client.

**Middleware protection** (`middleware.ts` at root):

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isAccountRoute = createRouteMatcher(['/orders(.*)', '/profile(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    // Require auth AND admin role
    await auth.protect((has) => has({ role: 'org:admin' }));
  }
  if (isAccountRoute(req)) {
    // Require auth only
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jld?|webp?|png|jpe?g|svg|woff2?|ttf|eot|ico)).*)', '/(api|trpc)(.*)'],
};
```

**Server-side auth check in admin layouts** — add a second layer of defense:

```typescript
// src/app/(admin)/admin/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') redirect('/');
  return <div className="admin-shell">{children}</div>;
}
```

**Clerk setup for admin roles:** Assign roles via Clerk's Organizations feature or add a `role: 'admin'` field to `publicMetadata` through the Clerk Dashboard or a webhook. Then check `sessionClaims.metadata.role` or `has({ role: 'org:admin' })` in middleware.

---

### 3c. Cloudinary Image Uploads (Admin)

Use **signed uploads** in production — never unsigned — to prevent unauthorized storage use.

**Flow:**
1. Admin clicks upload button → `CldUploadWidget` (client component) requests a signature.
2. Signature endpoint (`/api/cloudinary/sign/route.ts`) generates a signed payload server-side using `CLOUDINARY_API_SECRET`.
3. Widget uploads directly to Cloudinary (bypassing your server — no file size limits).
4. On success callback, a Server Action saves `{ url, cloudinaryId }` to the database and calls `revalidatePath()`.

```typescript
// src/app/api/cloudinary/sign/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }
  const { paramsToSign } = await req.json();
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );
  return Response.json({ signature });
}
```

**Store both `url` (secure_url) and `cloudinaryId` (public_id)** in `ProductImage`. The `public_id` is needed to delete images from Cloudinary when an admin removes them and to generate Cloudinary URL transformations (resize, format conversion, WebP).

**For bulk product images:** allow multi-upload via `CldUploadWidget` with `multiple: true`, then save each returned asset as a `ProductImage` row with an incrementing `position`.

---

### 3d. Clerk Auth — Full Integration Pattern

**Environment variables:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

**Root layout** wraps everything in `<ClerkProvider>`:
```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Reading auth in Server Components:**
```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

// Get userId and claims (fast, no extra network call)
const { userId, sessionClaims } = await auth();

// Get full user object (makes a Clerk API call)
const user = await currentUser();
```

**Sync Clerk users to your Customer table:** Use a Clerk webhook (`user.created`) at `/api/webhooks/clerk/route.ts` to create a `Customer` row when a new user signs up. This keeps your DB consistent without lazy-creating rows mid-checkout.

---

### 3e. Resend Email

Send transactional emails from Server Actions or the Stripe webhook handler:

```typescript
// src/lib/email.ts
import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY);
```

**Email triggers:**
- Order confirmed → `OrderConfirmationEmail` (order summary, items, total)
- Order shipped → `ShippingUpdateEmail` (tracking number, carrier link)
- Custom request received → `CustomRequestAcknowledgementEmail`
- Custom request quoted → `QuoteReadyEmail` (price, accept link)
- Password-less sign-in (handled by Clerk)

Use [React Email](https://react.email) for templates: write emails as React components in `src/lib/email-templates/`.

---

## 4. Caching Strategy for Product Pages

**Next.js 15 changed the default:** `fetch()` calls are **uncached** by default. You must explicitly opt into caching.

### Product Listing Page (`/products`)

```typescript
// Revalidate every 5 minutes, or on-demand when admin edits a product
export const revalidate = 300; // seconds

// OR use on-demand revalidation only (better for admin-driven content)
import { unstable_cache } from 'next/cache';

const getProducts = unstable_cache(
  async () => prisma.product.findMany({ where: { isActive: true } }),
  ['products-list'],
  { tags: ['products'], revalidate: 300 }
);
```

### Product Detail Page (`/products/[slug]`)

```typescript
// Generate static params at build time for all active products
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
    where: { isActive: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

// Revalidate when product is updated
export const revalidate = 600; // 10 min fallback
```

### On-Demand Revalidation (Best Approach for Admin)

When admin saves a product, call `revalidatePath` and `revalidateTag`:

```typescript
// src/app/(admin)/admin/products/[id]/edit/actions.ts
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: ProductFormData) {
  await prisma.product.update({ where: { id }, data });
  revalidateTag('products');          // invalidates all cached product queries
  revalidatePath('/products');         // invalidates listing page
  revalidatePath(`/products/${data.slug}`); // invalidates detail page
}
```

### Caching Strategy Summary

| Page | Strategy | Revalidation |
|---|---|---|
| Homepage / Featured products | ISR + tag-based | On admin save |
| Product listing | ISR (300s) + tag-based | On admin save |
| Product detail | Static generation + ISR fallback | On admin save |
| Category pages | ISR (600s) | On category edit |
| Cart / Checkout | No cache (dynamic) | — |
| Admin pages | No cache (always fresh) | — |
| Orders / Account | No cache (user-specific) | — |

---

## 5. Data Flow

### Customer Purchase Flow

```
Customer → Product Page (static/ISR)
         → Add to Cart (localStorage or DB cart)
         → Checkout Page
         → Server Action: create Stripe Checkout Session
           (pass orderId as metadata)
         → Stripe Checkout (hosted)
         → Stripe → POST /api/webhooks/stripe
           → Verify signature
           → Update Order status (PAYMENT_RECEIVED)
           → Send confirmation email via Resend
         → Redirect to /checkout/success
```

### Admin Product Update Flow

```
Admin → /admin/products/[id]/edit
      → Edit form (Server Component with pre-filled data)
      → Upload images → Cloudinary (signed upload widget)
      → Submit form → Server Action (updateProduct)
        → Validate with Zod
        → prisma.product.update()
        → revalidatePath + revalidateTag
        → redirect back to product list
```

### Custom Order Request Flow

```
Customer → /custom-orders form
         → Server Action: createCustomRequest
           → Save to CustomOrderRequest (status: SUBMITTED)
           → Send acknowledgement email via Resend
Admin    → /admin/custom-requests
         → Reviews request, sets quotedPrice
         → Status: QUOTED → sends quote email to customer
Customer → Accepts quote → creates a standard Order at quoted price
```

---

## 6. Build Order Recommendations

Build in phases so each phase is shippable and testable before moving on.

### Phase 1 — Foundation (Week 1)
1. Scaffold Next.js 15 project with TypeScript and Tailwind
2. Set up PostgreSQL database (local dev: Docker; prod: Hostinger or Neon)
3. Write Prisma schema, run first migration, seed with test data
4. Install and configure Clerk — middleware, `ClerkProvider`, sign-in/sign-up pages
5. Create Clerk → Customer sync webhook (`user.created`)
6. Set up Prisma singleton in `src/lib/prisma.ts`

### Phase 2 — Storefront Core (Week 2)
7. Product listing page with category filtering (ISR)
8. Product detail page with image gallery (static generation)
9. Category pages
10. Responsive header + footer + mobile nav
11. Basic homepage with featured products

### Phase 3 — Cart & Checkout (Week 3)
12. Cart state (use `zustand` or server-side cart table)
13. Stripe integration: create Checkout Session via Server Action
14. Checkout success page
15. Stripe webhook handler → order creation → Resend order confirmation
16. Order history page (`/orders`)

### Phase 4 — Admin Dashboard (Week 4)
17. Admin route protection (middleware + layout guard)
18. Product CRUD with Cloudinary image upload
19. Category management
20. Order management (status updates, tracking number entry)
21. Discount code management

### Phase 5 — Enhanced Features (Week 5)
22. Customer reviews (submit, admin moderation, display with star rating)
23. Custom order request form + admin workflow + email notifications
24. Discount code application at checkout
25. On-demand revalidation wired to all admin save actions

### Phase 6 — Polish & Launch (Week 6)
26. SEO: `generateMetadata` on product and category pages
27. Error pages (`error.tsx`, `not-found.tsx`)
28. Loading skeletons (`loading.tsx`)
29. Email template design
30. Environment variable audit and production Hostinger deployment
31. Stripe webhook registration for production URL
32. Performance audit (Core Web Vitals, image optimization)

---

## Sources

- [Best Practices for Organizing Next.js 15 (2025) — DEV Community](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji)
- [Next.js Official Docs — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Ultimate Guide to Next.js 15 Project Structure — Wisp CMS](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure)
- [Next.js App Router Route Groups and Nested Layouts — BetterLink Blog](https://eastondev.com/blog/en/posts/dev/20251218-nextjs-routing-best-practices/)
- [Stripe + Next.js 15: Complete 2025 Guide — Pedro Alonso](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)
- [Stripe Checkout and Webhook in Next.js 15 — Medium](https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e)
- [Clerk Authentication in Next.js 15 App Router — Build with Matija](https://www.buildwithmatija.com/blog/clerk-authentication-nextjs15-app-router)
- [Clerk Middleware Docs — clerkMiddleware()](https://clerk.com/docs/reference/nextjs/clerk-middleware)
- [Complete Authentication Guide for Next.js App Router 2025 — Clerk](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router)
- [Cloudinary Image Uploads Using Next.js App Router — Cloudinary](https://cloudinary.com/blog/cloudinary-image-uploads-using-nextjs-app-router)
- [Upload Assets with Server Actions in Next.js — Cloudinary Docs](https://cloudinary.com/documentation/upload_assets_with_server_actions_nextjs_tutorial)
- [Next.js ISR Guide — Next.js Official Docs](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
- [Advanced Caching Strategies in Next.js 2025 — Medium](https://medium.com/@itsamanyadav/advanced-caching-strategies-in-next-js-2025-edition-6805939cf163)
- [Next.js 15 Caching — Default Uncached for Predictable Data](https://devactivity.com/posts/apps-tools/nextjs-15-caching-shift-boosting-predictability-and-software-development-quality-metrics/)
- [Modern Full-Stack Application Architecture Using Next.js 15+ — SoftwareMill](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)
- [How to Build a Full-Stack App with Next.js, Prisma, and Postgres — Vercel](https://vercel.com/kb/guide/nextjs-prisma-postgres)
- [Prisma + Next.js E-Commerce (open source) — GitHub](https://github.com/sesto-dev/next-prisma-tailwind-ecommerce)
- [E-commerce Prisma Schema (GraphQL backoffice example) — GitHub](https://github.com/Weakky/prisma-ecommerce)
