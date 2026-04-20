import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { updateOrderStatus, addOrderNote } from "@/lib/actions/admin";

type Props = { params: Promise<{ id: string }> };

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

const allStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true,
      adminActions: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!order) notFound();

  const customerName = order.customer
    ? [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || order.customer.email
    : order.guestEmail ?? "Guest";

  const customerEmail = order.customer?.email ?? order.guestEmail;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="text-sm" style={{ color: "#8888aa" }}>← Orders</Link>
        <h1 className="text-2xl font-bold text-[#f0f0ff]">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
        <span
          className="px-3 py-1 rounded-lg text-sm font-semibold"
          style={{
            background: `${statusColors[order.status] ?? "#8888aa"}18`,
            color: statusColors[order.status] ?? "#8888aa",
          }}
        >
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Customer info */}
        <div className="rounded-xl p-5" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
          <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "#8888aa" }}>Customer</p>
          <p className="font-medium text-[#f0f0ff]">{customerName}</p>
          {customerEmail && <p className="text-sm mt-1" style={{ color: "#8888aa" }}>{customerEmail}</p>}
          <p className="text-sm mt-1" style={{ color: "#8888aa" }}>
            {order.fulfillment === "pickup" ? "🏪 Local Pickup" : "📦 Shipped"}
            {order.discreetPacking && <span className="ml-2" style={{ color: "#ec4899" }}>🔒 Discreet</span>}
          </p>
          <p className="text-xs mt-2" style={{ color: "#8888aa" }}>
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Shipping */}
        {order.fulfillment === "ship" && order.shippingLine1 && (
          <div className="rounded-xl p-5" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "#8888aa" }}>Ship To</p>
            <p className="text-sm text-[#f0f0ff]">{order.shippingLine1}</p>
            {order.shippingLine2 && <p className="text-sm text-[#f0f0ff]">{order.shippingLine2}</p>}
            <p className="text-sm text-[#f0f0ff]">{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
            <p className="text-sm" style={{ color: "#8888aa" }}>{order.shippingCountry}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <p className="px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa", borderBottom: "1px solid #1e1e30" }}>Items</p>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: "1px solid #13131e" }}>
            {item.imageSnapshot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageSnapshot} alt={item.nameSnapshot} className="w-10 h-10 rounded object-cover flex-shrink-0" style={{ border: "1px solid #1e1e30" }} />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-[#f0f0ff]">{item.nameSnapshot}</p>
              <p className="text-xs" style={{ color: "#8888aa" }}>Qty: {item.quantity} × {formatCents(item.priceSnapshot)}</p>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#22d3ee" }}>{formatCents(item.priceSnapshot * item.quantity)}</p>
          </div>
        ))}
        <div className="px-5 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: "#8888aa" }}>Subtotal</span>
            <span className="text-[#f0f0ff]">{formatCents(order.subtotalCents)}</span>
          </div>
          {order.shippingCents > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: "#8888aa" }}>Shipping</span>
              <span className="text-[#f0f0ff]">{formatCents(order.shippingCents)}</span>
            </div>
          )}
          {order.discountCents > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: "#8888aa" }}>Discount</span>
              <span style={{ color: "#4ade80" }}>-{formatCents(order.discountCents)}</span>
            </div>
          )}
          <div className="h-px" style={{ background: "#1e1e30" }} />
          <div className="flex justify-between font-bold">
            <span className="text-[#f0f0ff]">Total</span>
            <span style={{ color: "#22d3ee" }}>{formatCents(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Update status */}
        <div className="rounded-xl p-5" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
          <p className="text-xs uppercase tracking-wide mb-4" style={{ color: "#8888aa" }}>Update Status</p>
          <div className="space-y-2">
            {allStatuses.map((s) => (
              <form key={s} action={async () => {
                "use server";
                await updateOrderStatus(id, s);
              }}>
                <button
                  type="submit"
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: order.status === s ? `${statusColors[s]}22` : "#13131e",
                    color: order.status === s ? statusColors[s] : "#8888aa",
                    border: `1px solid ${order.status === s ? statusColors[s] + "66" : "#1e1e30"}`,
                    fontWeight: order.status === s ? 600 : 400,
                  }}
                >
                  {order.status === s ? "✓ " : ""}{s}
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl p-5" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
          <p className="text-xs uppercase tracking-wide mb-4" style={{ color: "#8888aa" }}>Admin Notes</p>
          <form action={async (formData: FormData) => {
            "use server";
            await addOrderNote(id, formData.get("note") as string);
          }}>
            <textarea
              name="note"
              rows={5}
              defaultValue={order.notes ?? ""}
              placeholder="Internal notes…"
              className="w-full px-3 py-2 rounded-lg text-sm text-[#f0f0ff] resize-none outline-none focus:ring-1 focus:ring-[#a855f7] mb-3"
              style={{ background: "#13131e", border: "1px solid #1e1e30" }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
            >
              Save Note
            </button>
          </form>
        </div>
      </div>

      {/* Audit trail */}
      {order.adminActions.length > 0 && (
        <div className="mt-4 rounded-xl p-5" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
          <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "#8888aa" }}>Activity</p>
          <ul className="space-y-2">
            {order.adminActions.map((a) => (
              <li key={a.id} className="text-sm flex justify-between">
                <span style={{ color: "#8888aa" }}>{a.action.replace(/_/g, " ")}</span>
                <span className="text-xs" style={{ color: "#8888aa" }}>{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
