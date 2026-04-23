import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-6">Customers</h1>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e30" }}>
              {["Name", "Email", "Joined", "Orders"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || "—";
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #13131e" }}>
                  <td className="px-5 py-3 text-sm text-[#f0f0ff]">{name}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#8888aa" }}>{c.email}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#8888aa" }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: "#22d3ee" }}>
                    {c._count.orders}
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm" style={{ color: "#8888aa" }}>
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
