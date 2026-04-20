import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

const statusMessages: Record<string, string> = {
  PENDING: "Your order has been received and is awaiting processing.",
  PROCESSING: "We're printing your items! Estimated 3–5 business days.",
  SHIPPED: "Your order is on its way!",
  DELIVERED: "Your order has been delivered. Enjoy!",
  CANCELLED: "This order was cancelled.",
};

export default async function AccountOrderDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!customer) notFound();

  const order = await prisma.order.findFirst({
    where: { id, customerId: customer.id },
    include: { items: true },
  });

  if (!order) notFound();

  const isPickup = order.fulfillment === "pickup";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account/orders" className="text-sm" style={{ color: "#8888aa" }}>← Orders</Link>
        <h1 className="text-2xl font-bold text-[#f0f0ff]">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
      </div>

      {/* Status banner */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center gap-3"
        style={{
          background: `${statusColors[order.status] ?? "#8888aa"}10`,
          border: `1px solid ${statusColors[order.status] ?? "#8888aa"}44`,
        }}
      >
        <span
          className="px-3 py-1 rounded-lg text-sm font-semibold"
          style={{ background: `${statusColors[order.status]}22`, color: statusColors[order.status] }}
        >
          {order.status}
        </span>
        <p className="text-sm" style={{ color: "#8888aa" }}>
          {statusMessages[order.status]}
        </p>
      </div>

      {/* Items */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <p className="px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa", borderBottom: "1px solid #1e1e30" }}>
          Items
        </p>
        {order.items.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-5 py-4"
            style={idx < order.items.length - 1 ? { borderBottom: "1px solid #13131e" } : {}}
          >
            {item.imageSnapshot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageSnapshot}
                alt={item.nameSnapshot}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                style={{ border: "1px solid #1e1e30" }}
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-[#f0f0ff]">{item.nameSnapshot}</p>
              <p className="text-xs mt-0.5" style={{ color: "#8888aa" }}>Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#22d3ee" }}>
              {formatCents(item.priceSnapshot * item.quantity)}
            </p>
          </div>
        ))}

        {/* Totals */}
        <div className="px-5 py-4 space-y-2" style={{ borderTop: "1px solid #1e1e30" }}>
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

      {/* Fulfillment */}
      <div className="rounded-xl p-5 mb-6" style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}>
        <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "#8888aa" }}>Fulfillment</p>
        {isPickup ? (
          <p className="text-sm text-[#f0f0ff]">🏪 Local Pickup — Oklahoma City</p>
        ) : (
          <>
            <p className="text-sm text-[#f0f0ff]">📦 Shipped</p>
            {order.shippingLine1 && (
              <p className="text-sm mt-1" style={{ color: "#8888aa" }}>
                {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ""},{" "}
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
            )}
          </>
        )}
        <p className="text-xs mt-2" style={{ color: "#8888aa" }}>
          Ordered {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Review prompt for delivered orders */}
      {order.status === "DELIVERED" && (
        <div
          className="rounded-xl p-5"
          style={{ border: "1px solid rgba(168,85,247,0.3)", background: "rgba(168,85,247,0.05)" }}
        >
          <p className="text-sm font-medium text-[#f0f0ff] mb-1">How was your order?</p>
          <p className="text-sm mb-3" style={{ color: "#8888aa" }}>
            Leave a review for the products you purchased.
          </p>
          <div className="flex flex-wrap gap-2">
            {order.items.filter((i) => i.productId).map((item) => (
              <Link
                key={item.id}
                href={`/shop?review=${item.productId}`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}
              >
                Review: {item.nameSnapshot}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
