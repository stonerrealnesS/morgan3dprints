import Link from "next/link";
import { Suspense } from "react";
import { getFeaturedProducts, getCategories, getProducts } from "@/lib/actions/products";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { HeroSection } from "@/components/shop/HeroSection";
import { CategoryGrid } from "@/components/shop/CategoryGrid";
import { Testimonials } from "@/components/shop/Testimonials";
import { StreamSignupForm } from "@/components/shop/StreamSignupForm";

const NEON = [
  { color: "#a855f7", glow: "rgba(168,85,247,0.4)" },
  { color: "#22d3ee", glow: "rgba(34,211,238,0.4)" },
  { color: "#ec4899", glow: "rgba(236,72,153,0.4)" },
];

const CATEGORY_ICONS: Record<string, string> = {
  "keychains":       "🔑",
  "glow-in-the-dark":"🌙",
  "fidgets":         "🌀",
  "tiny-things":     "🔬",
  "doggos":          "🐾",
  "man-cave":        "💪",
  "for-the-ladies":  "💅",
  "at-the-office":   "💼",
  "at-the-house":    "🏠",
  "accessories":     "👜",
  "services":        "🔧",
  "custom":          "⚡",
  "420-friendly":    "🍃",
};

const PLACEHOLDER_CATEGORIES = [
  { name: "Keychains", slug: "keychains", icon: "🔑", ...NEON[0] },
  { name: "Glow in the Dark", slug: "glow-in-the-dark", icon: "🌙", ...NEON[1] },
  { name: "Custom Orders", slug: "custom", icon: "⚡", ...NEON[2] },
  { name: "Fidgets", slug: "fidgets", icon: "🌀", ...NEON[0] },
  { name: "Services", slug: "services", icon: "🔧", ...NEON[1] },
  { name: "Accessories", slug: "accessories", icon: "👜", ...NEON[2] },
];

export default async function HomePage() {
  const [featuredProducts, { regular: categories }, ducksByCategory] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
    getProducts({ categorySlug: "ducks", limit: 8 }),
  ]);

  // The Ducks category may not exist yet (it gets created the first time the
  // Whatnot Finds sorter runs) — fall back to a name search so this section
  // still shows the flagship product line in the meantime.
  const duckResult =
    ducksByCategory.total > 0 ? ducksByCategory : await getProducts({ search: "duck", limit: 8 });
  const duckShopHref = ducksByCategory.total > 0 ? "/shop/ducks" : "/shop?search=duck";

  const displayCategories =
    categories.length > 0
      ? categories.map((cat, i) => ({
          ...cat,
          icon: CATEGORY_ICONS[cat.slug] ?? "🖨️",
          ...NEON[i % NEON.length],
        }))
      : PLACEHOLDER_CATEGORIES;

  return (
    <div className="flex flex-col">
      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ─── The Ducks ────────────────────────────────────────────────────────── */}
      {duckResult.products.length > 0 && (
        <section
          className="w-full py-20"
          style={{ background: "#0d0d14", borderTop: "1px solid #1e1e30", borderBottom: "1px solid #1e1e30" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end gap-4 mb-2">
              <h2 className="text-3xl font-bold text-white">🦆 The Ducks</h2>
              <div
                className="flex-1 h-px mb-2"
                style={{ background: "linear-gradient(to right, rgba(236,72,153,0.6), transparent)" }}
              />
            </div>
            <p className="mb-10 text-sm" style={{ color: "#8888aa" }}>
              Our best-known line — one-of-a-kind multicolor 3D printed rubber ducks, sold live on Whatnot.
            </p>

            <ProductGrid products={duckResult.products} />

            <div className="mt-10 text-center">
              <Link
                href={duckShopHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                style={{
                  background: "rgba(236,72,153,0.1)",
                  border: "1px solid rgba(236,72,153,0.4)",
                  color: "#ec4899",
                }}
              >
                Shop All Ducks
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured Products ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end gap-4 mb-10">
          <h2 className="text-3xl font-bold text-white">Featured Products</h2>
          <div
            className="flex-1 h-px mb-2"
            style={{
              background:
                "linear-gradient(to right, rgba(168,85,247,0.6), transparent)",
            }}
          />
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl animate-pulse"
                  style={{ background: "#0d0d14" }}
                />
              ))}
            </div>
          }
        >
          {featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            /* Placeholder cards when DB is empty */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
                >
                  <div
                    className="aspect-square"
                    style={{
                      background:
                        "linear-gradient(135deg, #1a0a2e 0%, #0d1a2e 50%, #0a1a20 100%)",
                    }}
                  />
                  <div className="p-4 space-y-2">
                    <div
                      className="h-4 rounded animate-pulse"
                      style={{ background: "#1e1e30", width: "70%" }}
                    />
                    <div
                      className="h-4 rounded animate-pulse"
                      style={{ background: "#1e1e30", width: "40%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Suspense>

        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            style={{
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.4)",
              color: "#a855f7",
            }}
          >
            View All Products
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────────── */}
      <Testimonials />

      {/* ─── Category Highlights ──────────────────────────────────────────────── */}
      <section
        className="w-full py-20"
        style={{ background: "#0d0d14", borderTop: "1px solid #1e1e30" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end gap-4 mb-10">
            <h2 className="text-3xl font-bold text-white">Shop by Category</h2>
            <div
              className="flex-1 h-px mb-2"
              style={{
                background:
                  "linear-gradient(to right, rgba(34,211,238,0.6), transparent)",
              }}
            />
          </div>

          <CategoryGrid categories={displayCategories} />
        </div>
      </section>

      {/* ─── Stream signup ────────────────────────────────────────────────────── */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-4">
        <h2 className="text-2xl font-bold text-white">🦆 Never Miss a Drop</h2>
        <p className="max-w-lg text-sm" style={{ color: "#8888aa" }}>
          New pieces go live on Whatnot before they ever hit the shop. Drop your email and we&apos;ll
          let you know before the next stream starts.
        </p>
        <StreamSignupForm />
      </section>
    </div>
  );
}
