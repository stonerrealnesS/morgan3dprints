import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteOrder } from "@/lib/actions/admin";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

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

// Builds a query string from whichever of status/from/to are set, so status
// pills and the date filter form always compose instead of clobbering each
// other (picking a status keeps the date range, picking dates keeps the
// status, etc).
function buildQuery(params: { status?: string; from?: string; to?: string }) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const { status, from, to } = await searchParams;

  // Date range applies on top of (independent from) the status filter, so
  // switching status pills doesn't reset dates and vice versa.
  const dateWhere: { createdAt?: { gte?: Date; lt?: Date } } = {};
  if (from || to) {
    const createdAt: { gte?: Date; lt?: Date } = {};
    if (from) createdAt.gte = new Date(`${from}T00:00:00`);
    if (to) {
      const exclusiveEnd = new Date(`${to}T00:00:00`);
      exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
      createdAt.lt = exclusiveEnd;
    }
    dateWhere.createdAt = createdAt;
  }

  const where = { ...dateWhere, ...(status ? { status: status as never } : {}) };
  const currentQuery = buildQuery({ status, from, to });

  const [orders, summary, cancelledInRange] = await Promise.all([
    prisma.order.findMany({
      where,
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
    }),
    // Always excludes cancelled, regardless of the status pill selected, so
    // this reads as "what the site actually sold" for the date range.
    prisma.order.aggregate({
      where: { ...dateWhere, status: { not: "CANCELLED" } },
      _count: true,
      _sum: { totalCents: true },
    }),
    prisma.order.count({ where: { ...dateWhere, status: "CANCELLED" } }),
  ]);

  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-6">Orders</h1>

      {/* Date range filter */}
      <form className="flex items-end gap-3 flex-wrap mb-4" style={{ color: "#8888aa" }}>
        {status && <input type="hidden" name="status" value={status} />}
        <div>
          <label htmlFor="from" className="block text-xs uppercase tracking-wide mb-1">From</label>
          <input
            id="from"
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="px-3 py-1.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
            style={{ background: "#13131e", border: "1px solid #1e1e30" }}
          />
        </div>
        <div>
          <label htmlFor="to" className="block text-xs uppercase tracking-wide mb-1">To</label>
          <input
            id="to"
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="px-3 py-1.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
            style={{ background: "#13131e", border: "1px solid #1e1e30" }}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
        >
          Filter
        </button>
        {(from || to) && (
          <Link href={`/admin/orders${buildQuery({ status })}`} className="text-sm px-2 py-1.5" style={{ color: "#8888aa" }}>
            Clear dates
          </Link>
        )}
      </form>

      {/* Summary for the selected date range (always excludes cancelled) */}
      <div className="flex items-center gap-4 flex-wrap mb-6 px-4 py-3 rounded-lg text-sm" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
        <span style={{ color: "#8888aa" }}>
          {from || to ? "In range" : "All time"}:
        </span>
        <span className="font-semibold" style={{ color: "#22d3ee" }}>{summary._count} order{summary._count !== 1 ? "s" : ""}</span>
        <span className="font-semibold" style={{ color: "#4ade80" }}>{formatCents(summary._sum.totalCents ?? 0)}</span>
        {cancelledInRange > 0 && (
          <span style={{ color: "#8888aa" }}>({cancelledInRange} cancelled excluded)</span>
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href={`/admin/orders${buildQuery({ from, to })}`}
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
            href={`/admin/orders${buildQuery({ status: s, from, to })}`}
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
              {["Order", "Date", "Customer", "Items", "Total", "Status", "", ""].map((h, i) => (
                <th key={i} className="text-left px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa" }}>{h}</th>
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
                  <td className="px-5 py-3">
                    <form action={async () => {
                      "use server";
                      await deleteOrder(order.id, `/admin/orders${currentQuery}`);
                    }}>
                      <ConfirmSubmitButton
                        className="text-xs"
                        style={{ color: "#ef4444" }}
                        confirmMessage={
                          order.status === "CANCELLED"
                            ? `Permanently delete this cancelled order (#${order.id.slice(-8).toUpperCase()})? This can't be undone.`
                            : `This order is ${order.status}, not cancelled. Permanently delete it anyway? This can't be undone.`
                        }
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: "#8888aa" }}>
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
