"use client";

import { useState } from "react";
import Link from "next/link";
import { bulkAssignCategory, deleteProduct, toggleProductStock } from "@/lib/actions/admin";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

type ProductRow = {
  id: string;
  name: string;
  priceInCents: number;
  inStock: boolean;
  isMadeToOrder: boolean;
  isGlow: boolean;
  category: { name: string };
  images: { url: string }[];
};

type CategoryOption = { id: string; name: string };

export function ProductsTable({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: CategoryOption[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {/* Bulk category assignment toolbar — only shows once something is selected */}
      {selected.size > 0 && (
        <form
          action={bulkAssignCategory}
          className="mb-4 flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)" }}
        >
          {[...selected].map((id) => (
            <input key={id} type="hidden" name="productIds" value={id} />
          ))}
          <span className="text-sm font-medium text-[#f0f0ff]">
            {selected.size} selected
          </span>
          <select
            name="categoryId"
            required
            defaultValue=""
            className="px-3 py-2 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
            style={{ background: "#13131e", border: "1px solid #1e1e30" }}
          >
            <option value="" disabled>Move to category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs"
            style={{ color: "#8888aa" }}
          >
            Clear selection
          </button>
        </form>
      )}

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e30" }}>
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="accent-purple-500 w-4 h-4"
                  aria-label="Select all products"
                />
              </th>
              {["Product", "Category", "Price", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #13131e" }}>
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="accent-purple-500 w-4 h-4"
                    aria-label={`Select ${p.name}`}
                  />
                </td>
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
                    <form action={toggleProductStock.bind(null, p.id, !p.inStock)}>
                      <button type="submit" className="text-xs" style={{ color: "#8888aa" }}>
                        {p.inStock ? "Mark OOS" : "Mark In Stock"}
                      </button>
                    </form>
                    <form action={deleteProduct.bind(null, p.id)}>
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
                <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "#8888aa" }}>
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
