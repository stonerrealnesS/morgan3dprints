# Morgan 3D Prints — Known Pitfalls & Lessons Learned

> Researched April 2025–2026. Stack: Next.js 15, PostgreSQL + Prisma, Clerk, Stripe, Cloudinary, Hostinger VPS.
> Each pitfall includes Warning Signs, Prevention Strategy, and Which Phase to Address It.

---

## Table of Contents

1. [Next.js + Stripe E-Commerce Mistakes](#1-nextjs--stripe-e-commerce-mistakes)
2. [Stripe Webhook Pitfalls](#2-stripe-webhook-pitfalls)
3. [Hostinger + Next.js Deployment Issues](#3-hostinger--nextjs-deployment-issues)
4. [Prisma + PostgreSQL Pitfalls](#4-prisma--postgresql-pitfalls)
5. [Admin Dashboard Mistakes](#5-admin-dashboard-mistakes)
6. [E-Commerce-Specific Security Issues](#6-e-commerce-specific-security-issues)
7. [Product Page Performance Pitfalls](#7-product-page-performance-pitfalls)
8. [Clerk Auth Integration Mistakes](#8-clerk-auth-integration-mistakes)

---

## 1. Next.js + Stripe E-Commerce Mistakes

---

### 1.1 Hard-Coding Prices in Checkout Sessions

**What happens:** Developers hard-code a Stripe Price ID or dollar amount in the checkout session creation endpoint instead of looking up the live price from the database. When you change a price in your DB, the checkout still charges the old amount. Or worse — attackers can see the price ID and craft requests with different quantities.

**Warning Signs:**
- Checkout API route has `unit_amount: 999` literals in the code
- Price is passed as a client-submitted parameter (`req.body.price`)
- No server-side price lookup before creating the Stripe session

**Prevention Strategy:**
Always create Stripe Checkout sessions on the server by looking up the canonical price from your database using the product ID. Never trust a price submitted from the client. The flow should be: client sends product IDs + quantities → server looks up prices in DB → server calls `stripe.checkout.sessions.create()` with server-resolved amounts.

**Which Phase:** Before writing any checkout code. This is a foundational architecture decision.

---

### 1.2 Treating Stripe Checkout Success URL as Order Confirmation

**What happens:** Developers redirect the user to `/order-success?session_id=...` and immediately mark the order as complete when that page loads. The success URL fires client-side and can be hit by anyone who guesses the URL pattern. Orders get confirmed before payment is actually captured.

**Warning Signs:**
- Order status is set to "paid" inside a `useEffect` or page load on the success page
- No webhook handler exists, or the webhook doesn't update order status
- Duplicate orders appear in the database when customers refresh the success page

**Prevention Strategy:**
The success page should only display a confirmation message. All order fulfillment logic (creating the order record, updating inventory, sending confirmation email) must happen inside the `checkout.session.completed` webhook handler — not the success redirect. On the success page, show the order number fetched by session ID, but never write to the DB there.

**Which Phase:** Architecture phase, before building checkout flow.

---

### 1.3 Using `"use client"` Too High in the Component Tree

**What happens:** A `"use client"` directive placed at a high-level layout or page component converts that entire subtree from Server Components to Client Components. This disables server-side data fetching, exposes server secrets if not careful, and bloats the client bundle — which tanks product page performance.

**Warning Signs:**
- `"use client"` appears in files that don't contain event handlers or hooks
- Product listing pages feel slow to load initially despite being "static" data
- Large JS bundle sizes on product pages (check with `next build` output or Lighthouse)

**Prevention Strategy:**
Keep `"use client"` at the leaf level — only on components that genuinely need browser APIs, event listeners, or state (e.g., `AddToCartButton`, `ImageGallery`). Fetch product data in Server Components. Pass data down as props to Client Components. Use Suspense boundaries for streaming rather than making everything client-rendered.

**Which Phase:** Component architecture phase. Establish this convention before building product pages.

---

### 1.4 Fetching Data Sequentially (Waterfall) on Product Pages

**What happens:** Each `await` in a Server Component runs one-after-another: first fetch product details, then fetch reviews, then fetch related products. With 3 database queries at ~50ms each, the page takes 150ms+ before even a byte renders. Under load this compounds badly.

**Warning Signs:**
- Product pages feel noticeably slow even on fast connections
- `console.time` logs show sequential DB calls
- Using `await` for each query in sequence rather than `Promise.all`

**Prevention Strategy:**
Use `Promise.all([fetchProduct(), fetchReviews(), fetchRelated()])` to parallelize independent queries. Use Suspense streaming so the product name/price renders immediately while reviews stream in separately. For data that doesn't change often (product details for ~111 products), use Next.js `fetch` caching or Prisma-level query caching.

**Which Phase:** During product page implementation.

---

### 1.5 Not Handling Stripe's Test vs. Live Key Separation

**What happens:** Developers accidentally use live Stripe keys during development, or vice versa — deploy to production with test keys. Real customer payments fail silently or, worse, test transactions hit real bank accounts.

**Warning Signs:**
- `STRIPE_SECRET_KEY` doesn't have separate values per environment
- Webhook endpoint in Stripe dashboard points to localhost or staging URL in production
- Stripe Dashboard shows "test mode" but the site is live

**Prevention Strategy:**
Use separate `.env.local` (test keys), `.env.production` (live keys). Add a runtime check: if `NODE_ENV === 'production'` and `STRIPE_SECRET_KEY` starts with `sk_test_`, throw an error at startup. Register separate webhook endpoints in Stripe — one for test, one for live. Document this in your deployment checklist.

**Which Phase:** Before any deployment. Set up environment separation on Day 1.

---

## 2. Stripe Webhook Pitfalls

---

### 2.1 Not Verifying Webhook Signatures (or Breaking Verification)

**What happens:** Stripe signs every webhook payload with your webhook secret. If you skip `stripe.webhooks.constructEvent()`, any attacker can POST fake order completions to your endpoint and trigger fulfillment for free. Alternatively, developers verify correctly in dev but break it in production by calling `request.json()` before the raw body check.

**Warning Signs:**
- Webhook handler uses `req.body` (already-parsed JSON) instead of raw bytes
- No `STRIPE_WEBHOOK_SECRET` environment variable configured
- `stripe.webhooks.constructEvent()` is wrapped in a try/catch that silently swallows errors

**Prevention Strategy:**
In Next.js App Router, use `await req.text()` (not `req.json()`) to get the raw body string, then pass it to `stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)`. If verification throws, return 400 immediately — do not process. Never apply body-parsing middleware before the webhook route.

```typescript
// Correct App Router pattern
export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }
  // now handle event...
}
```

**Which Phase:** Before going live. Test with Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`).

---

### 2.2 Non-Idempotent Webhook Handlers (Double-Processing Orders)

**What happens:** Stripe retries webhook delivery if your endpoint doesn't return a 2xx within 30 seconds, or if there's a network blip. If your handler isn't idempotent, a single payment gets processed multiple times — creating duplicate orders, double-charging inventory, sending duplicate confirmation emails.

**Warning Signs:**
- Order records duplicate under load or during outages
- Inventory goes negative after a spike in orders
- Customer complaints about receiving duplicate confirmation emails
- No `stripeEventId` column in your orders or events table

**Prevention Strategy:**
Store the `event.id` in a database table (`ProcessedWebhookEvent`) with a unique constraint. At the top of your handler, check if `event.id` already exists — if so, return `200` immediately without processing. Use Prisma upserts (`upsert` on event ID) where possible. The check-and-insert should be atomic (wrap in a transaction or use `createOrIgnore` semantics).

**Which Phase:** During webhook implementation. This is non-negotiable before launch.

---

### 2.3 Webhook Handler Times Out Before Completing

**What happens:** Your webhook handler does too much work synchronously — sends emails, updates inventory, calls external APIs — and takes more than 30 seconds. Stripe marks it as failed and retries. Now you have the double-processing problem on top of a slow handler.

**Warning Signs:**
- Stripe Dashboard shows webhook events with status "Failed" or multiple retry attempts
- Handler includes `await sendEmail(...)` or other slow operations inline
- Response time logs show webhook endpoint taking 5-30+ seconds

**Prevention Strategy:**
Keep the webhook handler minimal: verify signature → mark event as received in DB → return 200. Do all heavy work asynchronously afterward (use a background job, a queue, or at minimum a non-blocking `setTimeout` pattern). For a solo operator without a queue service, at minimum: store the event payload, return 200, then process in a separate function. For 3D prints with a small order volume, a simple `setImmediate` pattern works.

**Which Phase:** Webhook implementation phase.

---

### 2.4 Webhooks Point to Wrong URL After Deployment

**What happens:** During development you configure Stripe webhooks to `https://your-staging-domain.com/api/webhooks/stripe`. You go live but forget to update the Stripe Dashboard webhook endpoint to the production URL. Production payments fire webhooks to staging (or nowhere), orders never fulfill.

**Warning Signs:**
- Orders show "pending payment" in your DB but Stripe shows payment as succeeded
- Stripe Dashboard → Developers → Webhooks shows failed deliveries
- The webhook URL in Stripe Dashboard contains "staging", "localhost", or the wrong domain

**Prevention Strategy:**
Add "Update Stripe webhook URL" as an explicit step in your go-live checklist. Use separate Stripe webhook endpoints for test and production environments. After deploying, send a test webhook from the Stripe Dashboard and verify it arrives and processes correctly.

**Which Phase:** Pre-launch deployment checklist.

---

### 2.5 Not Handling Out-of-Order Webhook Events

**What happens:** Stripe does not guarantee webhook delivery order. A `payment_intent.succeeded` might arrive before `checkout.session.completed`, or `charge.refunded` might arrive before the initial charge event is stored. If your handler assumes events arrive in chronological order, state gets corrupted.

**Warning Signs:**
- Order statuses flip incorrectly (e.g., "refunded" then back to "paid")
- Missing orders when processing resumes after downtime
- Handler throws "order not found" when trying to update status

**Prevention Strategy:**
Design handlers to be order-independent. For `checkout.session.completed`, use an upsert to create-or-update the order. Check the Stripe Dashboard event timestamps, not your processing time. Handle the case where a refund event arrives for an order that isn't in your DB yet (store it and reprocess). Subscribe only to the specific events you need — don't handle every event type.

**Which Phase:** Webhook design phase.

---

## 3. Hostinger + Next.js Deployment Issues

---

### 3.1 Trying to Deploy a Dynamic App on Shared Hosting

**What happens:** Hostinger's shared hosting only supports static HTML exports. A full Next.js 15 app with Server Components, Route Handlers, and Prisma cannot run on shared hosting. Developers waste days trying to configure it before realizing the constraint.

**Warning Signs:**
- Attempting to deploy without a VPS or Node.js Web App plan
- Getting 403 errors on all routes
- No `npm start` equivalent available in the hosting environment

**Prevention Strategy:**
For Morgan 3D Prints, you need either Hostinger's **Node.js Web Apps** plan (managed Node.js hosting) or a **VPS** plan. The Node.js Web App plan handles deployment via GitHub integration and runs `npm run build` + `npm start` automatically. VPS gives more control (PM2, Nginx) but requires more setup. Do not attempt shared hosting.

**Which Phase:** Before purchasing/configuring hosting. Confirm plan type supports Node.js server processes.

---

### 3.2 NEXT_PUBLIC_ Variables Not Set at Build Time

**What happens:** `NEXT_PUBLIC_*` environment variables are inlined into the client JavaScript bundle at build time — they cannot be injected at runtime. If you set them in Hostinger's runtime environment variables panel but not in the build step, they'll be `undefined` in the browser. This commonly breaks Cloudinary upload widgets, Stripe publishable keys, and Clerk's frontend API URL.

**Warning Signs:**
- Stripe publishable key or Clerk frontend API URL is `undefined` in the browser console
- Cloudinary upload widget fails to initialize
- Everything works locally but breaks in production

**Prevention Strategy:**
In Hostinger Node.js Web Apps, set all `NEXT_PUBLIC_*` variables in the environment variables section **before** triggering a deployment. These must be available during `npm run build`. Server-only secrets (database URL, Stripe secret key, webhook secret) only need runtime availability. Document which variables are needed at build time vs. runtime.

**Which Phase:** Before first production deployment. Add to deployment checklist.

---

### 3.3 Stripe Webhook URL Uses HTTP Instead of HTTPS

**What happens:** Stripe requires HTTPS for webhook endpoints. If your Hostinger domain doesn't have SSL configured yet when you register the webhook, Stripe will refuse to deliver events. Also, if SSL is terminated at a reverse proxy (Nginx) but your webhook handler checks for HTTPS, it may behave incorrectly.

**Warning Signs:**
- Stripe Dashboard shows "SSL certificate error" or "Connection refused" for webhook deliveries
- Domain is accessible via HTTPS for users but webhook registration fails
- Using `http://` in the Stripe webhook URL field

**Prevention Strategy:**
Ensure SSL is configured (Hostinger provides free Let's Encrypt SSL — activate it before going live). Always register Stripe webhooks with `https://`. If using Nginx as a reverse proxy, ensure it's properly forwarding `X-Forwarded-Proto` headers. Test the webhook endpoint directly with `curl -X POST https://yourdomain.com/api/webhooks/stripe` before configuring Stripe.

**Which Phase:** Pre-launch deployment checklist.

---

### 3.4 No Process Manager or Restart-on-Crash Configuration

**What happens:** On a Hostinger VPS without PM2 or equivalent, if the Next.js process crashes (OOM, unhandled exception), the site goes down and stays down until someone manually restarts it. For a solo operator this can mean extended downtime overnight.

**Warning Signs:**
- Site goes down after a period of inactivity or memory spikes
- No monitoring or alerting configured
- Using `node server.js` directly instead of PM2 or the Hostinger Node.js Web App manager

**Prevention Strategy:**
If on VPS: use PM2 (`pm2 start npm --name "morgan3d" -- start`, `pm2 startup`, `pm2 save`). PM2 restarts the process on crash and persists across reboots. If on Hostinger Node.js Web Apps plan: the platform handles restarts, but confirm this behavior in their docs. Set up uptime monitoring (UptimeRobot free tier pings your site every 5 minutes and emails you on downtime).

**Which Phase:** Deployment/infrastructure phase.

---

### 3.5 Database Connection String Points to Localhost in Production

**What happens:** Local development uses `DATABASE_URL=postgresql://localhost:5432/morgan3d`. Developers forget to update this before deploying to Hostinger. The app starts, seems fine (no build error), but crashes on any DB operation with a connection refused error.

**Warning Signs:**
- App deploys successfully but all DB-dependent pages return 500 errors
- Prisma logs show "Connection refused" or "ECONNREFUSED 127.0.0.1:5432"
- `DATABASE_URL` in Hostinger environment variables still contains `localhost`

**Prevention Strategy:**
Use a hosted PostgreSQL provider (Supabase, Neon, Railway, or Hostinger's managed DB). Set the production `DATABASE_URL` to the hosted database's connection string in Hostinger's environment variables panel. Add a startup check that validates the DB connection. Keep local `.env.local` separate from `.env.production` values.

**Which Phase:** Before any deployment attempt.

---

## 4. Prisma + PostgreSQL Pitfalls

---

### 4.1 Connection Pool Exhaustion from Missing Singleton Pattern

**What happens:** In Next.js development, hot reloading creates a new `PrismaClient` instance on every file change. Each instance opens its own connection pool (default: `num_cpus * 2 + 1` connections). After a few reloads, you hit PostgreSQL's connection limit and get `sorry, too many clients already`. In production, serverless-style cold starts have the same problem at scale.

**Warning Signs:**
- `PrismaClientInitializationError: sorry, too many clients already` in dev after a few minutes
- Database connections grow unboundedly over time (check with `SELECT count(*) FROM pg_stat_activity`)
- Cold deploy causes a connection spike that crashes the DB

**Prevention Strategy:**
Use the singleton pattern in a dedicated `lib/prisma.ts` file:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

For production on a VPS (not serverless), the default pool is usually fine. Add `connection_limit` to `DATABASE_URL` if needed: `?connection_limit=10`.

**Which Phase:** Before writing any database code. Set up `lib/prisma.ts` first.

---

### 4.2 Running `prisma migrate dev` in Production

**What happens:** `prisma migrate dev` is for local development only. It can prompt interactively, reset the database, and generate new migration files. Running it in a production CI/CD pipeline or on the production server risks accidental data deletion and schema drift.

**Warning Signs:**
- Deployment script runs `npx prisma migrate dev` instead of `npx prisma migrate deploy`
- CI/CD pipeline includes `--create-only` or interactive migration flags
- Production database has been accidentally reset

**Prevention Strategy:**
Use `npx prisma migrate deploy` in all CI/CD and production contexts. This only applies existing migrations — it never generates new ones or resets data. Run it as part of your deployment script before `npm start`. The deploy command is safe to run repeatedly (idempotent). Keep `prisma migrate dev` strictly for local development.

**Which Phase:** CI/CD setup phase. Before first production deployment.

---

### 4.3 N+1 Query Problem on Order/Product Listings

**What happens:** When fetching a list of orders, each order then triggers a separate query for its line items, then each line item triggers a query for its product. For 50 orders with 3 items each, that's 1 + 50 + 150 = 201 database queries to render one page.

**Warning Signs:**
- Admin order list page is slow (2-5+ seconds)
- Prisma query logs show hundreds of `SELECT` statements for a single page load
- Database CPU spikes when loading order history

**Prevention Strategy:**
Use Prisma's `include` to eagerly load relations:

```typescript
const orders = await prisma.order.findMany({
  include: {
    items: {
      include: { product: true }
    },
    user: true
  },
  orderBy: { createdAt: 'desc' },
  take: 50,
});
```

Add database indexes on foreign keys (Prisma creates these automatically for `@relation` fields, but verify with `prisma db pull` or check migration SQL). For the admin dashboard, consider a dedicated denormalized "order summary" query.

**Which Phase:** During data model and query design. Audit with Prisma's `log: ['query']` option.

---

### 4.4 Missing Indexes on High-Traffic Query Columns

**What happens:** Product search, order filtering by status/date, and customer lookup by email all run full table scans without indexes. At 111 products this isn't critical, but as orders accumulate (1000+ orders), queries that took 5ms take 500ms.

**Warning Signs:**
- Order list loads fast initially but slows down over months
- `EXPLAIN ANALYZE` on common queries shows `Seq Scan` instead of `Index Scan`
- Filtering orders by status or date range is noticeably slow

**Prevention Strategy:**
Add indexes in your Prisma schema on columns used in `WHERE` clauses:

```prisma
model Order {
  id        String   @id
  status    String
  createdAt DateTime @default(now())
  userId    String

  @@index([status])
  @@index([createdAt])
  @@index([userId])
}
```

At minimum, index: `Order.status`, `Order.createdAt`, `Order.userId`, `Product.slug` (for URL lookups), `User.email`. Run `EXPLAIN ANALYZE` on your most common queries in staging before launch.

**Which Phase:** Schema design phase. Add indexes before launch, not after.

---

### 4.5 Using Connection Pooler URL for Prisma Migrations

**What happens:** Services like Supabase, Neon, or PgBouncer provide a "pooler" connection URL that routes through a connection pool proxy. Prisma Migrate requires a direct (non-pooled) connection for schema migrations — running migrations through a pooler causes errors like "prepared statement already exists" or lock failures.

**Warning Signs:**
- `prisma migrate deploy` fails with `prepared statement "s0" already exists`
- Migration runs fine locally but fails in CI/CD
- Using Supabase and only have one `DATABASE_URL` configured

**Prevention Strategy:**
Maintain two connection URLs:
- `DATABASE_URL` — the pooler URL, used by the app at runtime
- `DIRECT_URL` — the direct connection URL, used only for migrations

In `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Your deployment script then runs: `DIRECT_URL=... npx prisma migrate deploy`.

**Which Phase:** Database setup phase. Before writing the first migration.

---

## 5. Admin Dashboard Mistakes

---

### 5.1 No Bulk Order Status Updates

**What happens:** When you have 20 orders to mark as "shipped" after a print run, you have to open each order individually, click "Mark as Shipped," confirm, go back, repeat. After a week of this you hate your own admin panel.

**Warning Signs:**
- Order list has no checkboxes
- Status updates require navigating to individual order detail pages
- You dread opening the admin panel on Monday mornings

**Prevention Strategy:**
Build bulk actions before launch, not after: checkboxes on order rows, a "Mark Selected as Shipped" dropdown, and a single API call that updates multiple order IDs in one Prisma `updateMany`. Also add bulk "Export to CSV" for printing shipping labels. It's much harder to retrofit this after the data layer is established.

**Which Phase:** Admin dashboard design phase. Include in initial scope.

---

### 5.2 No Order Search or Filtering

**What happens:** You have 200 orders and a customer emails about order #ORD-0157. You scroll through a paginated list trying to find it. Or you want to see all "pending" orders — but there's no status filter.

**Warning Signs:**
- Admin order list only shows chronological pagination
- No search bar for order ID, customer name, or email
- No status filter tabs (All / Pending / Fulfilled / Refunded)

**Prevention Strategy:**
Include from the start: a search input (debounced, queries by order ID and customer email), status filter tabs, and date range picker. Implement these as URL search params so filters are shareable and survive page refresh. The Prisma query uses `where: { AND: [statusFilter, searchFilter, dateFilter] }`.

**Which Phase:** Admin dashboard design phase.

---

### 5.3 Admin Routes Not Properly Protected

**What happens:** `/admin` routes are visually hidden from regular users but not actually protected server-side. Any user who knows the URL can access admin functions, view all orders, or trigger fulfillment actions.

**Warning Signs:**
- Admin route protection is only in the UI (hidden nav links)
- No server-side role check in admin page Server Components or API routes
- `isAdmin` check only happens in client-side middleware

**Prevention Strategy:**
Check admin role server-side in every admin Server Component and Route Handler. With Clerk, use `auth()` to get the session and check against a custom claim or database role:

```typescript
const { userId } = await auth();
const user = await prisma.user.findUnique({ where: { clerkId: userId } });
if (!user?.isAdmin) redirect('/');
```

Do not rely on middleware alone for admin authorization — middleware can be bypassed in some configurations (see CVE-2025-29927).

**Which Phase:** Before building any admin functionality.

---

### 5.4 No Audit Log for Admin Actions

**What happens:** You cancel an order, update a product price, or issue a refund. Six months later you have no idea when it happened, what it was changed from, or whether it was intentional. No audit trail means you can't debug customer disputes or catch mistakes.

**Warning Signs:**
- Admin actions (order status changes, price updates, refunds) leave no log
- Customer disputes have no paper trail
- You can't tell if a price was changed and when

**Prevention Strategy:**
Create a simple `AdminAction` Prisma model with fields: `id`, `adminUserId`, `action` (string like `"ORDER_STATUS_CHANGED"`), `entityType`, `entityId`, `oldValue` (JSON), `newValue` (JSON), `createdAt`. Write to this table on every admin mutation. Display the last 50 actions on the dashboard home page. This takes a few hours to implement initially but saves enormous debugging time.

**Which Phase:** Admin dashboard implementation phase.

---

### 5.5 Dashboard Homepage Shows Vanity Metrics, Not Actionable Data

**What happens:** The dashboard shows "Total Revenue All Time" and "Total Orders" in big numbers. What you actually need every morning: orders awaiting fulfillment, new orders since yesterday, and low-stock products. The dashboard tells you how the past went but not what to do today.

**Warning Signs:**
- Dashboard shows lifetime stats but no "pending action" items
- No count of orders in "pending" or "processing" status prominently displayed
- You check the order list page more than the dashboard

**Prevention Strategy:**
Design the dashboard around the daily operator workflow:
- "X orders need fulfillment" (prominent, clickable)
- "X new orders in last 24 hours"
- "Low stock products" (if you track inventory)
- Recent order list (last 10 orders with status)

Keep revenue charts secondary — accessible but not the primary view.

**Which Phase:** Admin dashboard design phase. Validate against your actual daily workflow.

---

## 6. E-Commerce-Specific Security Issues

---

### 6.1 Price Manipulation via Client-Side Parameters

**What happens:** An attacker intercepts the checkout request with Burp Suite or browser devtools and changes `price: 99.99` to `price: 0.01` in the request body. If the server creates the Stripe session using the client-submitted price, they buy a $99 product for a penny.

**Warning Signs:**
- Checkout API accepts `price` or `amount` as a request body parameter from the client
- Line item totals are calculated on the frontend and sent to the server
- No server-side price lookup before creating the Stripe session

**Prevention Strategy:**
The server must never trust client-submitted prices. The checkout API should only accept product IDs and quantities. The server looks up the price from the database and creates the Stripe session with the authoritative amount. Validate product IDs exist and quantities are positive integers. This is the same as Pitfall 1.1 but framed as a security issue — it deserves emphasis here too.

**Which Phase:** Before writing any checkout code. Security review before launch.

---

### 6.2 Next.js CVE-2025-29927 — Middleware Authorization Bypass

**What happens:** A critical vulnerability (CVSS 9.1) in Next.js versions 11.1.4–15.2.2 allows attackers to bypass middleware-based authentication by adding a single HTTP header (`x-middleware-subrequest`). If your admin protection relies solely on `clerkMiddleware()` redirecting unauthenticated users, an attacker can bypass it entirely.

**Warning Signs:**
- Running Next.js < 15.2.3 (check `package.json`)
- Admin route protection exists only at the middleware level
- No server-side auth check inside admin Server Components or Route Handlers

**Prevention Strategy:**
Update Next.js to 15.2.3 or later immediately. Additionally, add defense-in-depth: check authentication inside every admin Server Component using `auth()` from Clerk, not just in middleware. Middleware should be a first line of defense, not the only one.

**Which Phase:** Immediately (if already deployed). Before launch (if building).

---

### 6.3 React Server Components RCE Vulnerabilities (2025)

**What happens:** Several critical vulnerabilities were disclosed in 2025 affecting the RSC protocol:
- **CVE-2025-55182 / CVE-2025-66478**: Unauthenticated Remote Code Execution via insecure deserialization of specially crafted HTTP requests. CVSS 10.0.
- **CVE-2025-55183 / CVE-2025-55184**: Crafted requests cause server CPU exhaustion (DoS) or return compiled source code of Server Actions.

**Warning Signs:**
- Running a Next.js version prior to the December 2025 security patch
- App Router is enabled (all RSC-based apps are potentially affected)
- Self-hosted deployment (Vercel-hosted apps received automatic patches)

**Prevention Strategy:**
Keep Next.js updated. Subscribe to Next.js security advisories at [nextjs.org/blog](https://nextjs.org/blog). On Hostinger VPS, you are responsible for your own updates — set a monthly reminder to check `npm outdated` and apply security patches. Never expose the `__nextjs_original-stack-frames` endpoint publicly.

**Which Phase:** Ongoing maintenance. Build update checks into your monthly routine.

---

### 6.4 Cloudinary Unsigned Upload Presets Exposed

**What happens:** For the admin product image upload flow, using an unsigned Cloudinary upload preset means anyone who discovers the preset name can upload arbitrary files to your Cloudinary account. While they can't delete your images, they can exhaust your storage quota and incur bandwidth charges.

**Warning Signs:**
- `CldUploadWidget` or Cloudinary upload widget is configured with an unsigned preset
- The preset name is visible in client-side JavaScript or network requests
- `CLOUDINARY_API_SECRET` has `NEXT_PUBLIC_` prefix (it's exposed to the browser)

**Prevention Strategy:**
Use signed uploads for the admin upload flow. Generate the upload signature server-side in a Route Handler using your `CLOUDINARY_API_SECRET` (never exposed to the client). The client requests a signature, gets it from your server, then uploads directly to Cloudinary with that signature. Only use unsigned presets for truly public, low-risk use cases. Never put `CLOUDINARY_API_SECRET` in a `NEXT_PUBLIC_` variable.

**Which Phase:** Before building the product image upload feature.

---

### 6.5 Missing Rate Limiting on Checkout and Auth Endpoints

**What happens:** Bots systematically hit your checkout endpoint to test stolen card numbers (card testing fraud). Each failed attempt costs you Stripe fees (even for declined cards, you may pay dispute/dispute-prevention fees). Account registration endpoints are hit by credential stuffing attacks.

**Warning Signs:**
- Stripe Dashboard shows many failed payment attempts with different cards in short succession
- Unusual volume of Stripe `payment_intent.payment_failed` events
- Account creation spikes with disposable email addresses

**Prevention Strategy:**
Add rate limiting to `/api/checkout`, `/api/webhooks/*`, and auth endpoints. Use Clerk's built-in bot protection for auth flows. For the checkout endpoint, implement IP-based rate limiting (e.g., max 5 checkout attempts per IP per hour using an in-memory store like `lru-cache` or a Redis instance). Enable Stripe Radar (available on all plans) and configure rules to block common card testing patterns.

**Which Phase:** Before launch. This is a revenue-protection issue, not just a security nicety.

---

### 6.6 Exposing Internal Order/User IDs in URLs

**What happens:** URLs like `/orders/1`, `/orders/2`, `/orders/3` expose sequential integer IDs. Authenticated users can enumerate other users' order details by changing the ID in the URL — an Insecure Direct Object Reference (IDOR) vulnerability.

**Warning Signs:**
- Order IDs in URLs are small sequential integers (`/orders/47`)
- Order detail page doesn't verify the requesting user owns the order
- No authorization check beyond "user is logged in"

**Prevention Strategy:**
Use UUIDs or CUIDs for order IDs (Prisma's `@default(cuid())` or `@default(uuid())`). More importantly, always verify ownership server-side: `WHERE id = :orderId AND userId = :currentUserId`. Even with UUIDs, authorization checks are mandatory — UUIDs aren't secret.

**Which Phase:** Schema design phase. Use cuid/uuid from the start.

---

## 7. Product Page Performance Pitfalls

---

### 7.1 Unoptimized Product Images (Missing WebP/AVIF Conversion)

**What happens:** Product images uploaded as PNG or JPEG at 2-4MB each are served as-is. A product page with 6 images delivers 12-24MB to the user. Mobile users on 4G wait 8+ seconds. Core Web Vitals (LCP) score tanks, hurting SEO.

**Warning Signs:**
- Product images are served with `.jpg` or `.png` extension without format negotiation
- Lighthouse shows LCP > 2.5 seconds
- Network tab shows images in MB range, not KB
- `<img>` tags instead of Next.js `<Image>` component

**Prevention Strategy:**
Always use Next.js `<Image>` component for product images — it automatically serves WebP/AVIF, adds lazy loading, and prevents layout shift. Configure Cloudinary as the image loader in `next.config.js` for additional optimization (automatic format selection, resizing, quality compression). Set `sizes` prop correctly so mobile doesn't download desktop-sized images:

```tsx
<Image
  src={product.imageUrl}
  alt={product.name}
  width={800}
  height={800}
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isAboveFold}
/>
```

**Which Phase:** Before building product page components. Establish image conventions early.

---

### 7.2 Missing `priority` Prop on Above-the-Fold Images

**What happens:** The Next.js `<Image>` component lazy-loads all images by default. The main product hero image — visible immediately on page load — is lazy-loaded, delaying LCP by 1-2 seconds because the browser waits to fetch it.

**Warning Signs:**
- Lighthouse flags "Largest Contentful Paint element" is an image that loaded late
- Network waterfall shows the hero image request starts after page interactive
- LCP score is in the "Needs Improvement" (2.5-4s) range

**Prevention Strategy:**
Add `priority` to the first visible product image (the hero). Only use `priority` on images above the fold — using it on every image defeats the purpose. For product listing pages, add `priority` only to the first 3-4 product card images.

**Which Phase:** During product page and listing page implementation.

---

### 7.3 Not Configuring `remotePatterns` for Cloudinary Images

**What happens:** Next.js blocks optimization of images from external domains unless they're whitelisted in `next.config.js`. If `remotePatterns` is not configured for `res.cloudinary.com`, Next.js either throws an error or falls back to unoptimized serving.

**Warning Signs:**
- Console error: "hostname 'res.cloudinary.com' is not configured under images in your `next.config.js`"
- Images load but without optimization (large file sizes, no WebP conversion)
- Build warnings about image domains

**Prevention Strategy:**
Add to `next.config.js`:
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      pathname: '/your-cloud-name/**',
    },
  ],
},
```

**Which Phase:** During initial Next.js configuration setup.

---

### 7.4 Over-Fetching Product Data on Listing Pages

**What happens:** The product listing page fetches all product fields including long descriptions, full-resolution image URLs, and metadata — when it only needs name, thumbnail, price, and slug. With 111 products, this is unnecessary data transferred on every page load.

**Warning Signs:**
- Product listing query selects `SELECT *` or uses Prisma `findMany` without `select`
- Large JSON payloads in network tab for the listing page
- Admin product list loads all same data as the customer-facing list

**Prevention Strategy:**
Use Prisma `select` to fetch only what's needed for each context:

```typescript
// Listing page — minimal fields
const products = await prisma.product.findMany({
  select: { id: true, name: true, slug: true, price: true, thumbnailUrl: true },
});

// Detail page — full fields
const product = await prisma.product.findUnique({
  where: { slug },
});
```

**Which Phase:** During data layer implementation.

---

### 7.5 No Static Generation for Product Pages

**What happens:** Product pages are rendered dynamically on every request, even though product data rarely changes. Each page load hits the database and reconstructs the HTML. This adds 100-500ms of latency per request and puts unnecessary load on the database.

**Warning Signs:**
- Product pages have no `generateStaticParams` defined
- Every product page request shows DB activity in Prisma logs
- TTFB (Time to First Byte) on product pages exceeds 500ms

**Prevention Strategy:**
Use `generateStaticParams` to pre-render all 111 product pages at build time:

```typescript
export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}
```

Use `revalidate` for ISR (Incremental Static Regeneration) to refresh pages when products change. For products you update infrequently, `revalidate: 3600` (1 hour) is reasonable. Call `revalidatePath('/products/[slug]')` from the admin panel when you update a product.

**Which Phase:** During product page implementation.

---

## 8. Clerk Auth Integration Mistakes

---

### 8.1 Missing `<ClerkProvider>` Wrapping

**What happens:** Clerk's hooks (`useAuth`, `useUser`) and components (`<SignInButton>`, `<UserButton>`) throw errors if called outside a `<ClerkProvider>`. The most common mistake is wrapping only part of the app, then adding a new page that calls a Clerk hook and getting cryptic "context not found" errors.

**Warning Signs:**
- Error: "You are trying to use Clerk outside of a ClerkProvider component"
- Auth components work on some pages but not others
- `ClerkProvider` is in a nested layout, not the root `layout.tsx`

**Prevention Strategy:**
Wrap your entire app by placing `<ClerkProvider>` in the root `app/layout.tsx`, wrapping `{children}`. Never place it in a nested layout unless you have a specific reason. The root layout is the correct and only location:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html><body>{children}</body></html>
    </ClerkProvider>
  );
}
```

**Which Phase:** Project setup, Day 1.

---

### 8.2 Middleware Configured to Protect No Routes by Default

**What happens:** `clerkMiddleware()` does not protect any routes by default — all routes are public. Developers assume that installing Clerk and adding the middleware file automatically protects their dashboard and account pages. It does not. Unauthenticated users can access all routes.

**Warning Signs:**
- `/account`, `/orders`, `/admin` are accessible without being signed in
- Middleware exists but has no route protection rules configured
- No call to `auth.protect()` or route-matching logic in `middleware.ts`

**Prevention Strategy:**
Explicitly define which routes need protection in `middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/account(.*)', '/orders(.*)', '/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

**Which Phase:** Auth setup phase, immediately after installing Clerk.

---

### 8.3 Server Actions Not Individually Protected

**What happens:** Even if middleware protects the `/admin` route, a Server Action defined in an admin page can be called from any route via a POST request with the right headers. An attacker can call your admin's `deleteProduct` Server Action from an unauthenticated context if it's not individually guarded.

**Warning Signs:**
- Server Actions contain no `auth()` call at the top
- Admin Server Actions trust that middleware already verified the user
- No `userId` or role check at the beginning of mutation functions

**Prevention Strategy:**
Every Server Action that mutates data or accesses protected information must start with an auth check:

```typescript
'use server';
import { auth } from '@clerk/nextjs/server';

export async function updateOrderStatus(orderId: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user?.isAdmin) throw new Error('Forbidden');

  // proceed with update...
}
```

**Which Phase:** Before building any admin or account mutation functionality.

---

### 8.4 Syncing Clerk Users to Database Incorrectly

**What happens:** Clerk manages authentication, but your Prisma database needs a `User` record for each customer (to store orders, addresses, preferences). Common mistakes: creating the DB user record on first page load (race condition with concurrent tabs), not handling the Clerk user deletion webhook, or storing Clerk's `userId` in a non-indexed column.

**Warning Signs:**
- Duplicate `User` records in the database for the same Clerk user
- Orders exist with no associated user because the DB record wasn't created yet
- Clerk `userId` is stored but not indexed, causing slow user lookups

**Prevention Strategy:**
Use Clerk's webhook events to sync users. Listen for `user.created`, `user.updated`, and `user.deleted` events at `/api/webhooks/clerk`. On `user.created`, create the Prisma `User` record. Use `upsert` (not `create`) to handle retries safely. Index `clerkId` in your Prisma schema:

```prisma
model User {
  id       String @id @default(cuid())
  clerkId  String @unique
  email    String @unique
  // ...
  @@index([clerkId])
}
```

**Which Phase:** Auth and data model design phase.

---

### 8.5 Reading Auth State in Layouts Causing Full Dynamic Rendering

**What happens:** Calling `auth()` or `currentUser()` inside a root layout forces the entire layout — and all its children — to opt into dynamic rendering. This disables static generation for every page in your app, even product pages that could otherwise be fully static.

**Warning Signs:**
- `next build` output shows all pages as "dynamic" (λ) instead of static (○)
- Product pages are slower than expected despite using `generateStaticParams`
- `auth()` or `cookies()` is called in `app/layout.tsx`

**Prevention Strategy:**
Do not call `auth()` or `currentUser()` in the root layout. Instead, use Clerk's `<SignedIn>`, `<SignedOut>`, and `<UserButton>` client components in the navbar — these read auth state client-side without forcing dynamic rendering. Read `auth()` only in the specific Server Components or Route Handlers that actually need it.

**Which Phase:** During layout and auth integration, before building page components.

---

### 8.6 Not Handling the CVE-2025-29927 Middleware Bypass for Admin Routes

**What happens:** (See also Section 6.2) Clerk's middleware-based protection is implemented as Next.js middleware. The CVE-2025-29927 vulnerability allows the middleware to be bypassed entirely via the `x-middleware-subrequest` header. Admin routes protected only by Clerk middleware can be accessed without authentication on unpatched Next.js versions.

**Warning Signs:**
- Next.js version is < 15.2.3 (check with `npm list next`)
- Admin pages have no server-side auth check beyond middleware

**Prevention Strategy:**
Update Next.js to 15.2.3+. Add server-side auth checks in every admin Server Component independent of middleware. Think of middleware as a UX convenience (redirecting to login) and server-side auth as the real security gate.

**Which Phase:** Immediately on any existing deployment. Before launch for new builds.

---

## Quick Reference: Critical Must-Dos Before Launch

| # | Must-Do | Risk if Skipped |
|---|---------|-----------------|
| 1 | Never trust client-submitted prices | Customers buy products for $0.01 |
| 2 | Verify Stripe webhook signatures with raw body | Fake orders triggered by attackers |
| 3 | Make webhook handlers idempotent | Duplicate orders on Stripe retries |
| 4 | Update Next.js to 15.2.3+ | Admin bypass via CVE-2025-29927 |
| 5 | Use `prisma migrate deploy` (not `dev`) in production | Accidental DB reset |
| 6 | Set Prisma singleton pattern | DB connection exhaustion under load |
| 7 | Index `clerkId`, `Order.status`, `Order.createdAt` | Slow queries as data grows |
| 8 | Protect Server Actions with auth checks individually | Admin actions callable by anyone |
| 9 | Set `NEXT_PUBLIC_*` vars before build step | Keys undefined in production |
| 10 | Use signed Cloudinary uploads in admin | Quota exhaustion / unauthorized uploads |
| 11 | Add bulk order actions to admin dashboard | Operational pain as orders grow |
| 12 | Use `generateStaticParams` for product pages | Unnecessary DB load per page view |

---

*Sources consulted: Stripe Docs, Clerk Docs, Next.js Security Advisories, Prisma Docs, Hostinger deployment guides, CVE disclosures (2025), and community lessons from DEV Community, Medium, and GitHub Discussions.*
