import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { category: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        priceInCents: true,
        inStock: true,
        isMadeToOrder: true,
        isGlow: true,
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
        >
          + New Product
        </Link>
      </div>

      <form method="GET" className="mb-6 flex gap-2">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search by name or category…"
          className="flex-1 px-4 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
          style={{ background: "#13131e", border: "1px solid #1e1e30" }}
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e1e30" }}
        >
          Search
        </button>
        {search && (
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ color: "#8888aa", border: "1px solid #1e1e30" }}
          >
            Clear
          </Link>
        )}
      </form>
      {search && (
        <p className="text-xs mb-4" style={{ color: "#8888aa" }}>
          {products.length} result{products.length !== 1 ? "s" : ""} for &quot;{search}&quot;
        </p>
      )}

      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
