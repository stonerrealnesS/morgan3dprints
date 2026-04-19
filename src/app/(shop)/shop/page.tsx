import { Suspense } from "react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/actions/products";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SearchBar } from "@/components/shop/SearchBar";
import { CategoryTabs } from "@/components/shop/CategoryTabs";

type ShopPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
};

export const metadata = {
  title: "Shop All Products",
  description:
    "Browse all custom 3D-printed products from Morgan 3D Prints. Keychains, glow-in-the-dark pieces, fidgets, accessories, and more.",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const categorySlug = params.category ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const [{ products, total, totalPages }, { regular: categories }] =
    await Promise.all([
      getProducts({
        search: search || undefined,
        categorySlug: categorySlug || undefined,
        page,
        limit: 12,
      }),
      getCategories(),
    ]);

  function buildPageUrl(newPage: number) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (categorySlug) p.set("category", categorySlug);
    if (newPage > 1) p.set("page", String(newPage));
    const qs = p.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-1">
          Shop All Products
        </h1>
        <p style={{ color: "#8888aa" }} className="text-sm">
          {total} product{total !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
        <Suspense fallback={null}>
          <CategoryTabs categories={categories} />
        </Suspense>
      </div>

      {/* Product grid */}
      <ProductGrid products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          {page > 1 ? (
            <Link
              href={buildPageUrl(page - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: "#0d0d14",
                border: "1px solid #1e1e30",
                color: "#f0f0ff",
              }}
            >
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
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              Previous
            </Link>
          ) : (
            <div className="w-[120px]" />
          )}

          <span className="text-sm" style={{ color: "#8888aa" }}>
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={buildPageUrl(page + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: "#0d0d14",
                border: "1px solid #1e1e30",
                color: "#f0f0ff",
              }}
            >
              Next
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
          ) : (
            <div className="w-[120px]" />
          )}
        </div>
      )}
    </div>
  );
}
