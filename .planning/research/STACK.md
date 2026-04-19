# Morgan 3D Prints — Tech Stack Research
**Research date:** April 2026  
**Project:** Solo-operator 3D print e-commerce, ~111 products, Hostinger (Node.js), bold neon dark-theme UI.

---

## 1. Validated Choices

### Next.js 15 (App Router) — VALIDATED
Next.js 15 is the correct choice and is considered the default production React framework as of 2026. The App Router is mature and well-supported. Key e-commerce patterns (Server Components for product pages, Server Actions for cart mutations, Route Handlers for Stripe webhooks) all work cleanly in the App Router model.

**Hostinger + Next.js: Works, with caveats** (see Concerns section).  
Hostinger has an official [`deploy-nextjs` starter repo](https://github.com/hostinger/deploy-nextjs) and Business/Cloud plans support managed Node.js app deployment directly from a GitHub repository. The system auto-detects the framework and sets up build/start scripts automatically. Static export (`output: "export"`) is for static sites only — do **not** use it for this project since it requires dynamic routes (cart, accounts, admin). Use the full Node.js server mode.

### PostgreSQL + Prisma ORM — VALIDATED (with version caveat)
Solid, battle-tested pairing for e-commerce. Prisma's relational model is ideal for the data shape: products, orders, users, reviews, discount codes. The official Prisma guide targets this exact stack.

**Use Prisma 6, not Prisma 7** (see Concerns). For a solo operator starting fresh in 2026, stick with Prisma 6 to avoid Prisma 7's breaking changes while they stabilize.

Critical production pattern — use the singleton to prevent connection pool exhaustion from Next.js hot reloading:

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Add `connection_limit=5` to your `DATABASE_URL` for the Hostinger Node.js environment (not serverless, so a higher limit than 1 is fine).

### Tailwind CSS v4 + Framer Motion — VALIDATED
Tailwind v4 + Next.js 15 + React 19 is a confirmed production stack. Tailwind v4 no longer requires `tailwind.config.js` (auto-scanning) and uses a new PostCSS plugin (`@tailwindcss/postcss`). The global CSS file structure changes — import with `@import "tailwindcss"` instead of the old three-layer directives.

Framer Motion v12 is compatible with Next.js 15/React 19. For the bold neon dark-theme, use Framer Motion for page transitions, product card hover animations, and cart drawer slides.

### Stripe — VALIDATED (full feature set needed)
Stripe is the right choice. For a full e-commerce implementation, these specific Stripe features are required:

**Payment flow:**
- **Payment Intents API** — create server-side before rendering checkout (never client-side)
- **Payment Element** (not the older Card Element) — handles all payment methods, SCA compliance, 3D Secure automatically
- **Stripe Checkout Sessions** — simplest path to production-ready checkout with built-in validation

**Discount codes:**
- Use Stripe's native **Coupons + Promotion Codes** API. Create coupons (% or fixed amount off) and generate customer-facing promo codes that map to them. Enable `allow_promotion_codes: true` on the Checkout Session. No need to build a custom discount system.

**Webhooks (critical):**
- Set up a `POST /api/webhooks/stripe` route handler
- Verify signature with `stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)`
- Listen for at minimum: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`, `charge.refunded`
- **Never fulfill orders client-side** — always wait for the webhook event

**Other features to enable:**
- Stripe Tax (automatic tax calculation)
- Automatic email receipts (can offload order confirmation to Stripe)
- Customer Portal for refund/dispute management in admin

### Cloudinary — VALIDATED (best choice for this use case)
Cloudinary is the right tool for a product image catalog. Key advantages over alternatives:
- On-the-fly image transformations (resize, crop, format, quality) via URL parameters
- Auto-format delivery (WebP/AVIF based on browser support)
- CDN delivery globally
- AI-powered features (background removal, smart crop) useful for 3D print product shots
- Free tier: 25 credits/month (generous for ~111 products)

Uploadthing is simpler but lacks transformation capabilities. Supabase Storage has no image transformations. For a product catalog where you need thumbnails, zoom views, and optimized delivery, Cloudinary is the clear winner.

Integrate with Next.js `Image` component using Cloudinary as a custom loader, or use the official `next-cloudinary` package.

### Resend — VALIDATED (best for this stack)
Resend is the right email choice for a Next.js project. Key advantages:
- Designed specifically for React/Next.js developers
- Templates are written as React JSX components (via `react-email`)
- 3,000 emails/month free tier (no expiration)
- Clean modern API
- Excellent deliverability

Postmark has better raw deliverability (98.7% vs ~96%), but for a solo-operator store sending order confirmations and account emails, Resend's React Email integration and free tier make it the pragmatic choice.

SendGrid: do not use — free tier is gone, API is older, overkill for this use case.

---

## 2. Concerns & Alternatives

### CONCERN: Hostinger Managed Hosting vs VPS
**The managed Node.js hosting (Business/Cloud plans) has meaningful constraints** for a full-stack Next.js app:

- No persistent filesystem writes (no local file storage)
- No cron job support (use Stripe webhooks + Resend for async tasks instead)
- Limited control over Node.js version and environment
- No WebSockets support in managed plans
- Cold starts may affect performance if app is idle

**Recommendation:** Use **Hostinger VPS** with CloudPanel (their managed VPS panel). A KVM VPS gives you:
- Root access and control over Node.js version
- PM2 for process management (keeps app always-on, no cold starts)
- Nginx as reverse proxy
- SSL via Let's Encrypt
- Ability to run PostgreSQL locally or connect to a managed database

Cost: Hostinger KVM VPS starts at ~$5-7/month, which is far more capable for a full-stack e-commerce app. This is the recommended path.

If staying on managed hosting: ensure you're on Business or Cloud plan, keep the PostgreSQL database external (Neon, Supabase, or Railway free tiers work), and use Cloudinary + Resend for all file/email needs (no local dependencies).

### CONCERN: Prisma 7 — Do NOT use yet
Prisma 7 (released mid-2025) has significant breaking changes that make it risky for a new project in 2026:
- ESM-only (no CommonJS) — may conflict with some tooling
- `datasource` URL moved from schema to `prisma.config.ts`
- `prisma migrate dev` no longer auto-generates client
- MongoDB not yet supported in v7
- Active GitHub issues around local database connections
- Requires `@prisma/adapter-pg` + `pg` explicitly

**Use Prisma 6 (`^6.x`)** — it is stable, well-documented, and fully supported. Migrate to v7 once it stabilizes (likely mid-2026).

### ALTERNATIVE: Better Auth vs Clerk
Clerk is validated for this project but consider the trade-offs:

| Factor | Clerk | Better Auth |
|--------|-------|-------------|
| Setup time | ~30 min | ~2-3 hours |
| Free tier | 10,000 MAU | Free (self-hosted) |
| Paid pricing | $0.02/MAU after free tier | $0 (just DB costs) |
| UI components | Pre-built, polished | Bring your own |
| Next.js App Router support | Native/excellent | Good |
| Data ownership | Clerk's servers | Your database |
| Admin user management | Built-in dashboard | Build your own |

**Verdict:** Clerk is the right choice for a solo operator. The pre-built UI components (sign-in, sign-up, user profile, account management) save significant development time. At ~111 products and a typical e-commerce customer base, you will not hit the 10,000 MAU free tier limit for a long time. The $20/month cost is only triggered at scale.

If budget is tight or data ownership is a concern, **Better Auth** is the best open-source alternative (more capable than NextAuth/Auth.js, with built-in 2FA, passkeys, and session management).

### ALTERNATIVE: Neon (PostgreSQL) as hosted DB
If using Hostinger managed hosting (not VPS), you need an external PostgreSQL provider. **Neon** is the best choice:
- Serverless PostgreSQL
- Generous free tier (0.5GB storage, 190 compute hours/month)
- Branching for dev/staging environments
- Compatible with Prisma out of the box
- Connection pooling built-in (important for serverless or managed environments)

---

## 3. Recommended Package Versions

```json
{
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "typescript": "^5.8.0",

    "@prisma/client": "^6.7.0",
    "prisma": "^6.7.0",

    "@clerk/nextjs": "^6.12.0",

    "stripe": "^17.7.0",
    "@stripe/stripe-js": "^5.8.0",

    "next-cloudinary": "^6.16.0",

    "resend": "^4.5.0",
    "@react-email/components": "^0.0.35",

    "framer-motion": "^12.9.0",

    "tailwindcss": "^4.1.0",
    "@tailwindcss/postcss": "^4.1.0",

    "zod": "^3.24.0",
    "zustand": "^5.0.0"
  }
}
```

**Notes on versions:**
- `next`: 15.3.x is the latest stable in the 15 series as of Q1 2026. Next.js 16 exists but is early-access.
- `prisma`: Use `^6.7.0` — do not use Prisma 7 yet.
- `@clerk/nextjs`: v6 is the current major for Next.js App Router; v5 is deprecated.
- `stripe`: v17 is the current JS SDK. Use `^17.x`.
- `framer-motion`: v12 is current and React 19-compatible.
- `tailwindcss`: v4.x — note the config changes described above.
- `zustand`: v5 — for client-side cart state management (simpler than Redux for this scope).
- `zod`: For all form and API input validation (pairs with `react-hook-form`).

**Additional recommended packages:**
```json
{
  "react-hook-form": "^7.54.0",
  "@hookform/resolvers": "^4.1.0",
  "lucide-react": "^0.511.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^3.2.0",
  "sharp": "^0.33.0"
}
```

---

## 4. Key Configuration Notes

### Tailwind v4 Setup (breaking change from v3)
Do NOT use `tailwind.config.js` setup. Tailwind v4 uses CSS-first configuration:

```css
/* app/globals.css */
@import "tailwindcss";

/* Custom dark neon theme tokens */
@theme {
  --color-neon-cyan: #00ffff;
  --color-neon-pink: #ff00ff;
  --color-neon-green: #39ff14;
  --color-dark-bg: #0a0a0a;
  --font-display: "Orbitron", sans-serif;
}
```

PostCSS config:
```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### Next.js 15 Config
```js
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "res.cloudinary.com" },
    ],
  },
  // Do NOT use output: "export" — needs full Node.js server
};

export default nextConfig;
```

### Clerk Middleware (App Router)
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/checkout(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth.protect();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

### Stripe Webhook Route Handler (App Router)
```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      // Fulfill order, send confirmation email via Resend
      break;
    case "payment_intent.payment_failed":
      // Handle failed payment
      break;
  }

  return new Response(null, { status: 200 });
}

// IMPORTANT: disable body parsing for webhook signature verification
export const config = { api: { bodyParser: false } };
```

### Hostinger VPS Deployment (PM2 + Nginx)
```bash
# Install PM2 globally
npm install -g pm2

# ecosystem.config.js at project root
module.exports = {
  apps: [{
    name: "morgan-3d-prints",
    script: "node_modules/.bin/next",
    args: "start",
    env: { NODE_ENV: "production", PORT: 3000 }
  }]
};

# Start & save
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Nginx reverse proxy config (CloudPanel handles this via UI — just set port to 3000).

### Environment Variables Checklist
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/morgan3dprints?connection_limit=5"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=orders@morgan3dprints.com
```

### Stripe Checkout Session with Promo Codes
```typescript
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: cartItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name, images: [item.imageUrl] },
      unit_amount: item.priceInCents,
    },
    quantity: item.quantity,
  })),
  allow_promotion_codes: true,  // enables discount code field at checkout
  automatic_tax: { enabled: true },
  success_url: `${process.env.NEXT_PUBLIC_URL}/orders/{CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
});
```

---

## 5. Final Recommendations Summary

| Component | Choice | Confidence |
|-----------|--------|------------|
| Framework | Next.js 15 (App Router) | High |
| Styling | Tailwind CSS v4 + Framer Motion v12 | High |
| Database | PostgreSQL via Prisma 6 | High |
| Auth | Clerk v6 | High (or Better Auth if cost-sensitive) |
| Payments | Stripe (Checkout Sessions + Webhooks) | High |
| Images | Cloudinary + `next-cloudinary` | High |
| Email | Resend + React Email | High |
| Hosting | Hostinger KVM VPS (not managed) | High |
| State (cart) | Zustand v5 | Medium-High |
| Validation | Zod + react-hook-form | High |

**Primary risk:** Hostinger managed Node.js hosting is underpowered for a full-stack app with database, file uploads, and webhooks. Default to VPS from the start to avoid migration pain later.

**Biggest time-saver:** Use Stripe's hosted Checkout + built-in promo codes rather than building a custom checkout UI. You can always build a custom Payment Element later once the store is live.
