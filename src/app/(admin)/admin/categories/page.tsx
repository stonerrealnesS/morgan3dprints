import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory } from "@/lib/actions/admin";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-8">Categories</h1>

      {/* Existing */}
      <div className="rounded-xl overflow-hidden mb-8" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e30" }}>
              {["Name", "Slug", "Products", "Adult", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: "1px solid #13131e" }}>
                <td className="px-5 py-3 text-sm font-medium text-[#f0f0ff]">{cat.name}</td>
                <td className="px-5 py-3 text-sm font-mono" style={{ color: "#8888aa" }}>{cat.slug}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#8888aa" }}>{cat._count.products}</td>
                <td className="px-5 py-3">
                  {cat.isAdult && (
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899" }}>18+</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {cat._count.products === 0 && (
                    <form action={async () => {
                      "use server";
                      await deleteCategory(cat.id);
                    }}>
                      <button type="submit" className="text-xs" style={{ color: "#ef4444" }}>Delete</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New category form */}
      <div className="rounded-xl p-6" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
        <h2 className="font-semibold text-[#f0f0ff] mb-4">Add Category</h2>
        <form action={createCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Name</label>
            <input
              name="name"
              required
              placeholder="e.g. Planters"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
              style={{ background: "#13131e", border: "1px solid #1e1e30" }}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#8888aa" }}>
            <input type="checkbox" name="isAdult" className="accent-pink-500 w-4 h-4" />
            18+ / Adult category (requires age verification)
          </label>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Create Category
          </button>
        </form>
      </div>
    </div>
  );
}
