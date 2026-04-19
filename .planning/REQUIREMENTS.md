# Morgan 3D Prints — v1 Requirements

## v1 Requirements

### Catalog & Products
- [ ] **CAT-01**: User can browse all products in a paginated catalog
- [ ] **CAT-02**: User can filter products by category
- [ ] **CAT-03**: User can search products by name/keyword
- [ ] **CAT-04**: User can view a product detail page with images, description, price, and material info
- [ ] **CAT-05**: User can see whether a product is in stock or made-to-order
- [ ] **CAT-06**: Products display "Glow in the Dark" and other material callouts where applicable

### Cart & Checkout
- [ ] **CART-01**: User can add products to a cart and see a running total
- [ ] **CART-02**: User can update quantities or remove items from the cart
- [ ] **CART-03**: User can choose pickup (local OKC) or shipping at checkout
- [ ] **CART-04**: User can check out as a guest (no account required)
- [ ] **CART-05**: User can apply a discount code at checkout
- [ ] **CART-06**: User completes payment via Stripe Checkout
- [ ] **CART-07**: User is redirected to a confirmation page after successful payment
- [ ] **CART-08**: User receives an order confirmation email after purchase

### Customer Accounts
- [ ] **AUTH-01**: User can create an account with email/password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can view their order history
- [ ] **AUTH-05**: User can save and manage shipping addresses

### Reviews
- [ ] **REV-01**: Logged-in user can leave a star rating and text review on a product
- [ ] **REV-02**: User can see all reviews and average rating on a product page

### Custom Orders
- [ ] **CUSTOM-01**: User can submit a "Print by the Hour" request with STL/OBJ/3MF file upload, filament preferences, and estimated hours
- [ ] **CUSTOM-02**: User can submit a custom order request with description, reference images, and contact info
- [ ] **CUSTOM-03**: User receives a confirmation email when a custom request is submitted

### Compliance & Trust
- [ ] **COMP-01**: User must acknowledge they are 18+ before accessing adult/cannabis product categories (age gate)
- [ ] **COMP-02**: User can select "discreet packaging" option at checkout
- [ ] **COMP-03**: Site displays made-in-USA and ships-nationwide trust badges

### Admin — Products
- [ ] **ADM-01**: Admin can add a new product (name, description, price, category, images, material, stock status)
- [ ] **ADM-02**: Admin can edit any product field
- [ ] **ADM-03**: Admin can delete a product
- [ ] **ADM-04**: Admin can upload product images via drag-and-drop (Cloudinary)
- [ ] **ADM-05**: Admin can manage product categories (add/edit/delete)
- [ ] **ADM-06**: Admin can create and manage discount codes (percent or fixed, expiry, usage limits)

### Admin — Orders
- [ ] **ADM-07**: Admin can view all orders with status, customer, total, and date
- [ ] **ADM-08**: Admin can update order status (pending, processing, shipped, delivered, cancelled)
- [ ] **ADM-09**: Admin can view order details (items, customer info, shipping address)
- [ ] **ADM-10**: Admin can view and respond to custom order requests
- [ ] **ADM-11**: Admin can bulk-update order status

### Email & Notifications
- [ ] **EMAIL-01**: Customer receives order confirmation email with items and total
- [ ] **EMAIL-02**: Customer receives shipping notification email when order is marked shipped
- [ ] **EMAIL-03**: Customer receives custom order acknowledgement email

### SEO & Performance
- [ ] **SEO-01**: Every product page has editable meta title and description
- [ ] **SEO-02**: Products have JSON-LD schema markup (enables Google rich results with ratings/price)
- [ ] **SEO-03**: Site has a sitemap.xml and robots.txt
- [ ] **SEO-04**: Product pages use static generation with ISR for fast load times
- [ ] **SEO-05**: All images are served in WebP format via Cloudinary

### Design & UX
- [ ] **UX-01**: Site uses bold neon dark theme (dark background, electric purple/cyan/pink accents, glowing UI elements)
- [ ] **UX-02**: Site is fully mobile responsive
- [ ] **UX-03**: Navigation includes search, cart icon with item count, and account menu
- [ ] **UX-04**: Homepage features hero section, featured products, and category highlights

---

## v2 Requirements (Deferred)

- Abandoned cart recovery emails (requires email capture pre-checkout)
- Product video/GIF support for glow-in-the-dark items
- Shipping rate calculation via Shippo API (v1 uses flat rate)
- Wishlist / save for later
- Loyalty/points system
- Social login (Google, Apple)
- Live chat / support widget
- Product bundles and upsells
- Wholesale / bulk pricing tiers

---

## Out of Scope

- Square integration — replaced by Stripe
- AWS S3 image hosting — replaced by Cloudinary
- PHP backend — replaced by Next.js API routes + PostgreSQL
- Multi-vendor marketplace — this is a single-operator store
- Physical POS integration — online only

---

## Traceability

| REQ-ID | Phase |
|--------|-------|
| CAT-01 to CAT-06 | Phase 2 |
| CART-01 to CART-08 | Phase 3 |
| AUTH-01 to AUTH-05 | Phase 1 + 3 |
| REV-01 to REV-02 | Phase 5 |
| CUSTOM-01 to CUSTOM-03 | Phase 5 |
| COMP-01 to COMP-03 | Phase 3 |
| ADM-01 to ADM-06 | Phase 4 |
| ADM-07 to ADM-11 | Phase 4 |
| EMAIL-01 to EMAIL-03 | Phase 3 + 5 |
| SEO-01 to SEO-05 | Phase 2 + 6 |
| UX-01 to UX-04 | Phase 1 + 2 |
