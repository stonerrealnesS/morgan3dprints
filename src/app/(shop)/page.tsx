import Link from "next/link";
import { Suspense } from "react";
import { getFeaturedProducts, getCategories } from "@/lib/actions/products";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { HeroSection } from "@/components/shop/HeroSection";
import { CategoryGrid } from "@/components/shop/CategoryGrid";

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
  const [featuredProducts, { regular: categories }] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

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
    </div>
  );
}
