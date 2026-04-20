import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  PROCESSING: "#22d3ee",
  SHIPPED: "#a855f7",
  DELIVERED: "#4ade80",
  CANCELLED: "#ef4444",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      totalCents: true,
      status: true,
      fulfillment: true,
      discreetPacking: true,
      guestEmail: true,
      customer: { select: { firstName: true, lastName: true, email: true } },
      items: { select: { nameSnapshot: true, quantity: true }, take: 3 },
      _count: { select: { items: true } },
    },
  });

  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-6">Orders</h1>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href="/admin/orders"
          className="px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            background: !status ? "#a855f7" : "#13131e",
            color: !status ? "#fff" : "#8888aa",
            border: "1px solid #1e1e30",
          }}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              background: status === s ? statusColors[s] + "22" : "#13131e",
              color: status === s ? statusColors[s] : "#8888aa",
              border: `1px solid ${status === s ? statusColors[s] + "66" : "#1e1e30"}`,
            }}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e30" }}>
              {["Order", "Date", "Customer", "Items", "Total", "Status", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const name = order.customer
                ? [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || order.customer.email
                : order.guestEmail ?? "Guest";

              const itemSummary =
                order.items.slice(0, 2).map((i) => `${i.nameSnapshot}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ") +
                (order._count.items > 2 ? ` +${order._count.items - 2} more` : "");

              return (
                <tr key={order.id} style={{ borderBottom: "1px solid #13131e" }}>
                  <td className="px-5 py-3 font-mono text-sm" style={{ color: "#8888aa" }}>
                    #{order.id.slice(-8).toUpperCase()}
                    {order.discreetPacking && (
                      <span className="ml-2 text-xs" style={{ color: "#ec4899" }}>🔒</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#8888aa" }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-[#f0f0ff] max-w-[140px] truncate">{name}</td>
                  <td className="px-5 py-3 text-sm max-w-[200px] truncate" style={{ color: "#8888aa" }}>{itemSummary}</td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: "#22d3ee" }}>
                    {formatCents(order.totalCents)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        background: `${statusColors[order.status] ?? "#8888aa"}18`,
                        color: statusColors[order.status] ?? "#8888aa",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs" style={{ color: "#a855f7" }}>
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: "#8888aa" }}>
                  No orders {status ? `with status ${status}` : "yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
