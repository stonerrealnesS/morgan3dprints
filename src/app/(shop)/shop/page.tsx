import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/actions/products";
import { InfiniteProductGrid } from "@/components/shop/InfiniteProductGrid";
import { SearchBar } from "@/components/shop/SearchBar";
import { CategoryTabs } from "@/components/shop/CategoryTabs";

type ShopPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
};

export const metadata = {
  title: "Shop All Products",
  description:
    "Browse all custom 3D-printed products from Morgan 3D Prints. Keychains, glow-in-the-dark pieces, fidgets, accessories, and more.",
};

const PAGE_SIZE = 12;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const categorySlug = params.category ?? "";

  const [{ products, total, totalPages }, { regular: categories }] =
    await Promise.all([
      getProducts({
        search: search || undefined,
        categorySlug: categorySlug || undefined,
        page: 1,
        limit: PAGE_SIZE,
      }),
      getCategories(),
    ]);

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

      {/* Product grid — loads more automatically as you scroll */}
      <InfiniteProductGrid
        key={`${categorySlug}::${search}`}
        initialProducts={products}
        initialPage={1}
        totalPages={totalPages}
        limit={PAGE_SIZE}
        categorySlug={categorySlug || undefined}
        search={search || undefined}
      />
    </div>
  );
}
