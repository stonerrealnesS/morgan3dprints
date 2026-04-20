import { prisma } from "@/lib/prisma";
import { createDiscount, toggleDiscount, deleteDiscount } from "@/lib/actions/admin";

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-8">Discount Codes</h1>

      {/* List */}
      <div className="rounded-xl overflow-hidden mb-8" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e30" }}>
              {["Code", "Type", "Value", "Usage", "Expires", "Active", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => {
              const expired = d.expiresAt && new Date(d.expiresAt) < new Date();
              return (
                <tr key={d.id} style={{ borderBottom: "1px solid #13131e", opacity: expired ? 0.5 : 1 }}>
                  <td className="px-5 py-3 font-mono text-sm font-bold text-[#f0f0ff]">{d.code}</td>
                  <td className="px-5 py-3 text-sm capitalize" style={{ color: "#8888aa" }}>{d.type}</td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: "#22d3ee" }}>
                    {d.type === "percent" ? `${d.value}%` : `$${(d.value / 100).toFixed(2)}`}
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#8888aa" }}>
                    {d.usageCount}{d.usageLimit ? `/${d.usageLimit}` : ""}
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: expired ? "#ef4444" : "#8888aa" }}>
                    {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-5 py-3">
                    <form action={async () => {
                      "use server";
                      await toggleDiscount(d.id, !d.isActive);
                    }}>
                      <button
                        type="submit"
                        className="w-10 h-5 rounded-full transition-colors relative"
                        style={{ background: d.isActive ? "#a855f7" : "#1e1e30" }}
                        title={d.isActive ? "Deactivate" : "Activate"}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                          style={{ left: d.isActive ? "calc(100% - 18px)" : "2px" }}
                        />
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <form action={async () => {
                      "use server";
                      await deleteDiscount(d.id);
                    }}>
                      <button type="submit" className="text-xs" style={{ color: "#ef4444" }}>Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {discounts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: "#8888aa" }}>
                  No discount codes yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create form */}
      <div className="rounded-xl p-6" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
        <h2 className="font-semibold text-[#f0f0ff] mb-4">Create Discount Code</h2>
        <form action={createDiscount} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Code</label>
              <input
                name="code"
                required
                placeholder="SAVE20"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] font-mono uppercase outline-none focus:ring-1 focus:ring-[#a855f7]"
                style={{ background: "#13131e", border: "1px solid #1e1e30" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Type</label>
              <select
                name="type"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
                style={{ background: "#13131e", border: "1px solid #1e1e30" }}
              >
                <option value="percent">Percent Off</option>
                <option value="fixed">Fixed Amount (cents)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Value (% or cents)</label>
              <input
                name="value"
                type="number"
                required
                min="1"
                placeholder="20"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
                style={{ background: "#13131e", border: "1px solid #1e1e30" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Usage Limit (optional)</label>
              <input
                name="usageLimit"
                type="number"
                min="1"
                placeholder="∞"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
                style={{ background: "#13131e", border: "1px solid #1e1e30" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Expiry Date (optional)</label>
            <input
              name="expiresAt"
              type="date"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
              style={{ background: "#13131e", border: "1px solid #1e1e30" }}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Create Code
          </button>
        </form>
      </div>
    </div>
  );
}
