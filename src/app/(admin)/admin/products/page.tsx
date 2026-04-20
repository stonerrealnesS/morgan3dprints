import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteProduct, toggleProductStock } from "@/lib/actions/admin";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
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
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
        >
          + New Product
        </Link>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e30" }}>
              {["Product", "Category", "Price", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #13131e" }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded object-cover flex-shrink-0" style={{ border: "1px solid #1e1e30" }} />
                    ) : (
                      <div className="w-10 h-10 rounded flex-shrink-0" style={{ background: "#1a1a2e", border: "1px solid #1e1e30" }} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#f0f0ff]">{p.name}</p>
                      {p.isGlow && <p className="text-xs" style={{ color: "#22d3ee" }}>Glow</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm" style={{ color: "#8888aa" }}>{p.category.name}</td>
                <td className="px-5 py-3 text-sm font-semibold" style={{ color: "#22d3ee" }}>{formatCents(p.priceInCents)}</td>
                <td className="px-5 py-3">
                  {p.isMadeToOrder ? (
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>Made to Order</span>
                  ) : p.inStock ? (
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80" }}>In Stock</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>Out of Stock</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-xs" style={{ color: "#a855f7" }}>Edit</Link>
                    <form action={async () => {
                      "use server";
                      await toggleProductStock(p.id, !p.inStock);
                    }}>
                      <button type="submit" className="text-xs" style={{ color: "#8888aa" }}>
                        {p.inStock ? "Mark OOS" : "Mark In Stock"}
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await deleteProduct(p.id);
                    }}>
                      <button type="submit" className="text-xs" style={{ color: "#ef4444" }}>
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: "#8888aa" }}>
                  No products yet. <Link href="/admin/products/new" style={{ color: "#a855f7" }}>Add one →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
