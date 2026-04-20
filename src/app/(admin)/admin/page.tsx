import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: "#0d0d14", border: `1px solid ${color}33` }}
    >
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#8888aa" }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#8888aa" }}>{sub}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const [orderStats, productCount, pendingRequests, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      _count: true,
      _sum: { totalCents: true },
    }),
    prisma.product.count(),
    prisma.customRequest.count({ where: { status: "new" } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        totalCents: true,
        status: true,
        fulfillment: true,
        guestEmail: true,
        customer: { select: { firstName: true, lastName: true, email: true } },
        items: { select: { nameSnapshot: true }, take: 1 },
      },
    }),
  ]);

  const statusColors: Record<string, string> = {
    PENDING: "#f59e0b",
    PROCESSING: "#22d3ee",
    SHIPPED: "#a855f7",
    DELIVERED: "#4ade80",
    CANCELLED: "#ef4444",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Orders"
          value={orderStats._count.toString()}
          color="#22d3ee"
        />
        <StatCard
          label="Total Revenue"
          value={formatCents(orderStats._sum.totalCents ?? 0)}
          color="#4ade80"
        />
        <StatCard
          label="Products"
          value={productCount.toString()}
          color="#a855f7"
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests.toString()}
          sub="Custom orders"
          color="#ec4899"
        />
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1e1e30" }}>
          <h2 className="font-semibold text-[#f0f0ff]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm" style={{ color: "#a855f7" }}>View all →</Link>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e30" }}>
              {["Order", "Customer", "Items", "Total", "Status", ""].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => {
              const name = order.customer
                ? [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || order.customer.email
                : order.guestEmail ?? "Guest";
              return (
                <tr key={order.id} style={{ borderBottom: "1px solid #13131e" }}>
                  <td className="px-6 py-3 font-mono text-sm" style={{ color: "#8888aa" }}>
                    #{order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-3 text-sm text-[#f0f0ff] truncate max-w-[160px]">{name}</td>
                  <td className="px-6 py-3 text-sm" style={{ color: "#8888aa" }}>
                    {order.items[0]?.nameSnapshot ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold" style={{ color: "#22d3ee" }}>
                    {formatCents(order.totalCents)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        background: `${statusColors[order.status] ?? "#8888aa"}18`,
                        color: statusColors[order.status] ?? "#8888aa",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs" style={{ color: "#a855f7" }}>
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm" style={{ color: "#8888aa" }}>
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
