# Morgan 3D Prints — New Website

## What This Is

A fully custom e-commerce website for Morgan 3D Prints (M3DP), a 3D printing business based in the OKC/Mustang/Yukon area of Oklahoma. The business sells custom 3D-printed products (novelty items, accessories, glow-in-the-dark pieces, keychains, etc.), offers "Print by the Hour" services, and takes custom orders. The new site replaces an outdated PHP/vanilla JS site that was hard to manage and lacked modern UX.

## Core Value

A beautiful, fast, easy-to-manage e-commerce store that makes customers want to buy and makes the owner's daily operations effortless.

## Context

- **Owner:** Solo operator (stone), based in OKC area
- **Old stack:** HTML/CSS/JS + PHP + Square + AWS S3 + Hostinger
- **Pain points with old site:** Hard to add/edit products, no real order management, unpolished UX, Square sync was unreliable
- **Hosting:** Hostinger (Node.js capable)
- **Products:** ~111 products across ~14 categories — mostly carrying over, possibly restructuring NSFW/420 categories

## Brand Direction

Full rebrand. Bold neon aesthetic:
- Dark background (near-black)
- Electric accent colors (purple, cyan, hot pink)
- Glowing product cards and UI elements
- Bold, modern typography
- Cyberpunk-meets-maker-culture feel

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + custom neon theme
- **Animations:** Framer Motion
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Clerk (customer accounts)
- **Payments:** Stripe (Checkout + webhooks)
- **Images:** Cloudinary
- **Email:** Resend
- **Hosting:** Hostinger (Node.js)

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Product catalog with categories and filtering/search
- [ ] Shopping cart and Stripe checkout
- [ ] Customer accounts (order history, saved addresses)
- [ ] Product reviews and ratings
- [ ] Custom order / Print-by-the-Hour request form
- [ ] Discount codes and promo system
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Admin dashboard — easy product management (add/edit/delete)
- [ ] Admin order management (view, update status, fulfill)
- [ ] Bold neon rebrand (dark bg, electric colors, glowing UI)
- [ ] Mobile responsive

### Out of Scope

- Square integration — replaced by Stripe
- AWS S3 image hosting — replaced by Cloudinary
- PHP backend — replaced by Next.js API routes + PostgreSQL

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over Shopify | Full custom control, no platform fees, matches "build it right" goal | — Pending |
| Stripe over Square | Better order management, cleaner API, industry standard | — Pending |
| Cloudinary over S3 | Easier image uploads via admin UI, free tier generous | — Pending |
| Clerk for auth | Best DX for customer accounts in Next.js, handles sessions/emails | — Pending |
| PostgreSQL + Prisma | Real database for orders/products vs. fragile JSON files | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

---
*Last updated: 2026-04-17 after initialization*
