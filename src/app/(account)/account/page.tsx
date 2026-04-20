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

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: { take: 2 } },
      },
    },
  });

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-[#8888aa] mb-4">Your account is being set up…</p>
        <p className="text-sm text-[#8888aa]">Try refreshing in a moment.</p>
      </div>
    );
  }

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "there";

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#f0f0ff]">Hey, {name} 👋</h1>
        <p className="text-[#8888aa] mt-1">{customer.email}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {[
          { href: "/account/orders", label: "Order History", icon: "📦", count: customer.orders.length },
          { href: "/account/addresses", label: "Addresses", icon: "🏠" },
          { href: "/services/custom-order", label: "Custom Order", icon: "✏️" },
        ].map(({ href, label, icon, count }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl p-5 flex flex-col gap-2 transition-colors hover:border-[#a855f7]"
            style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium text-[#f0f0ff]">{label}</span>
            {count !== undefined && (
              <span className="text-xs" style={{ color: "#8888aa" }}>{count} orders</span>
            )}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {customer.orders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#f0f0ff]">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm" style={{ color: "#a855f7" }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl px-5 py-4 transition-colors hover:border-[#1e1e50]"
                style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
              >
                <div>
                  <p className="text-sm font-mono text-[#f0f0ff]">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8888aa" }}>
                    {order.items.map((i) => i.nameSnapshot).join(", ")}
                    {order.items.length === 2 && "…"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: "#22d3ee" }}>{formatCents(order.totalCents)}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded mt-1 inline-block"
                    style={{
                      background: `${statusColors[order.status] ?? "#8888aa"}18`,
                      color: statusColors[order.status] ?? "#8888aa",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
