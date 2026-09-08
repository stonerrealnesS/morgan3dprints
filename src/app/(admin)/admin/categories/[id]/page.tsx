import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateCategoryProducts } from "@/lib/actions/admin";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string }>;
};

export default async function ManageCategoryProductsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { search } = await searchParams;

  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      categoryId: true,
      category: { select: { name: true } },
    },
  });

  async function doUpdate(formData: FormData) {
    "use server";
    await updateCategoryProducts(id, formData);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/categories" className="text-sm" style={{ color: "#8888aa" }}>← Categories</Link>
      </div>
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Manage: {category.name}</h1>
      <p className="text-sm mb-6" style={{ color: "#8888aa" }}>
        Check a product to put it in <span className="text-[#f0f0ff]">{category.name}</span>. Unchecking a
        product that&apos;s currently in this category moves it to Uncategorized rather than leaving it
        without one.
      </p>

      <form method="GET" className="mb-6 flex gap-2">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search products by name…"
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
            href={`/admin/categories/${id}`}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ color: "#8888aa", border: "1px solid #1e1e30" }}
          >
            Clear
          </Link>
        )}
      </form>

      <form action={doUpdate}>
        <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
          {products.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm" style={{ color: "#8888aa" }}>
              No products found.
            </p>
          ) : (
            <ul>
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                  style={{ borderBottom: "1px solid #13131e" }}
                >
                  <label className="flex items-center gap-3 text-sm cursor-pointer text-[#f0f0ff]">
                    <input
                      type="checkbox"
                      name="productIds"
                      value={p.id}
                      defaultChecked={p.categoryId === category.id}
                      className="accent-purple-500 w-4 h-4"
                    />
                    {p.name}
                  </label>
                  <span className="text-xs" style={{ color: "#555570" }}>
                    {p.categoryId === category.id ? "in this category" : `in ${p.category.name}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Save Changes
          </button>
          <Link href="/admin/categories" className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ color: "#8888aa", border: "1px solid #1e1e30" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
