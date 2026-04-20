import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

export default async function OrderHistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  const orders = customer
    ? await prisma.order.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        include: {
          items: { select: { nameSnapshot: true, quantity: true, priceSnapshot: true }, take: 3 },
          _count: { select: { items: true } },
        },
      })
    : [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-sm" style={{ color: "#8888aa" }}>← Account</Link>
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
        >
          <p className="text-[#8888aa] mb-4">No orders yet</p>
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-xl p-5 transition-colors hover:border-[#2a2a4a]"
              style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-mono text-sm text-[#f0f0ff]">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs mt-1" style={{ color: "#8888aa" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: "#22d3ee" }}>{formatCents(order.totalCents)}</p>
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded mt-1"
                    style={{
                      background: `${statusColors[order.status] ?? "#8888aa"}18`,
                      color: statusColors[order.status] ?? "#8888aa",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <p className="text-sm" style={{ color: "#8888aa" }}>
                {order.items.map((i) => `${i.nameSnapshot}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ")}
                {order._count.items > 3 && ` +${order._count.items - 3} more`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
