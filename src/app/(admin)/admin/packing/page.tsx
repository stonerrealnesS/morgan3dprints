import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { markOrderPacked, markOrderShipped } from "@/lib/actions/admin";

// Always live: never built ahead of time with old order data.
export const dynamic = "force-dynamic";

// Packing station: everything paid and not yet shipped, oldest first.
// Layout follows tools/pack_sheet.py in the business folder: pick list, then one card per order.

const channelColors: Record<string, string> = {
  website: "#a855f7",
  tiktok: "#ec4899",
  whatnot: "#f59e0b",
  mercari: "#22d3ee",
  poshmark: "#ef4444",
  facebook: "#3b82f6",
  palmstreet: "#4ade80",
  offerup: "#14b8a6",
};

function daysOld(date: Date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

export default async function AdminPackingPage() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "PROCESSING"] } },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      channel: true,
      channelOrderId: true,
      createdAt: true,
      status: true,
      packedAt: true,
      fulfillment: true,
      discreetPacking: true,
      notes: true,
      guestEmail: true,
      shippingLine1: true,
      shippingLine2: true,
      shippingCity: true,
      shippingState: true,
      shippingZip: true,
      shippingCountry: true,
      customer: { select: { firstName: true, lastName: true, email: true } },
      items: { select: { id: true, productId: true, nameSnapshot: true, quantity: true, imageSnapshot: true } },
    },
  });

  const toPack = orders.filter((o) => !o.packedAt);
  const packed = orders.filter((o) => o.packedAt);

  // Pick list: how many of each item to pull for orders not yet packed.
  const pick = new Map<string, { name: string; qty: number; orders: number }>();
  for (const o of toPack) {
    for (const i of o.items) {
      const key = i.productId ?? i.nameSnapshot;
      const row = pick.get(key) ?? { name: i.nameSnapshot, qty: 0, orders: 0 };
      row.qty += i.quantity;
      row.orders += 1;
      pick.set(key, row);
    }
  }
  const pickList = [...pick.values()].sort((a, b) => b.qty - a.qty || a.name.localeCompare(b.name));

  const card = { background: "#0d0d14", border: "1px solid #1e1e30" };

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Packing</h1>
        <p className="text-sm" style={{ color: "#8888aa" }}>
          {toPack.length} to pack · {packed.length} packed, waiting to ship
        </p>
      </div>

      {/* Pick list */}
      <section className="rounded-xl overflow-hidden mb-8" style={card}>
        <h2 className="px-5 py-3 text-xs uppercase tracking-wide" style={{ color: "#8888aa", borderBottom: "1px solid #1e1e30" }}>
          Pick list
        </h2>
        {pickList.length === 0 ? (
          <p className="px-5 py-6 text-sm" style={{ color: "#8888aa" }}>Nothing to pick.</p>
        ) : (
          <ul>
            {pickList.map((p) => (
              <li key={p.name} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: "1px solid #13131e" }}>
                <span className="text-2xl font-bold w-12 text-right" style={{ color: "#22d3ee" }}>{p.qty}</span>
                <span className="flex-1 text-[#f0f0ff]">{p.name}</span>
                <span className="text-xs" style={{ color: "#8888aa" }}>
                  {p.orders} order{p.orders === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Order cards */}
      {[
        { title: "To pack", list: toPack },
        { title: "Packed, ready to ship", list: packed },
      ].map(({ title, list }) =>
        list.length === 0 ? null : (
          <section key={title} className="mb-8">
            <h2 className="text-xs uppercase tracking-wide mb-3" style={{ color: "#8888aa" }}>{title}</h2>
            <div className="space-y-4">
              {list.map((o) => {
                const name = o.customer
                  ? [o.customer.firstName, o.customer.lastName].filter(Boolean).join(" ") || o.customer.email
                  : o.guestEmail ?? "Guest";
                const age = daysOld(o.createdAt);
                const colour = channelColors[o.channel] ?? "#8888aa";

                return (
                  <article key={o.id} className="rounded-xl p-5" style={{ ...card, opacity: o.packedAt ? 0.75 : 1 }}>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase" style={{ background: `${colour}22`, color: colour }}>
                        {o.channel}
                      </span>
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-sm" style={{ color: "#8888aa" }}>
                        #{(o.channelOrderId ?? o.id.slice(-8)).toUpperCase()}
                      </Link>
                      <span className="text-xs" style={{ color: age >= 3 ? "#ef4444" : "#8888aa" }}>
                        {age === 0 ? "today" : `${age} day${age === 1 ? "" : "s"} old`}
                      </span>
                      {o.status === "PENDING" && (
                        <span className="text-xs font-semibold" style={{ color: "#f59e0b" }}>PENDING: check it is paid</span>
                      )}
                    </div>

                    {o.discreetPacking && (
                      <p className="mb-3 px-3 py-2 rounded-lg font-bold" style={{ background: "#ec489922", color: "#ec4899" }}>
                        🔒 DISCREET PACKING
                      </p>
                    )}

                    <ul className="mb-3 space-y-1">
                      {o.items.map((i) => (
                        <li key={i.id} className="flex items-center gap-3 text-[#f0f0ff]">
                          {i.imageSnapshot && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={i.imageSnapshot} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" style={{ border: "1px solid #1e1e30" }} />
                          )}
                          <span className="text-lg font-bold" style={{ color: "#22d3ee" }}>{i.quantity}×</span>
                          <span>{i.nameSnapshot}</span>
                        </li>
                      ))}
                    </ul>

                    {o.notes && (
                      <p className="mb-3 px-3 py-2 rounded-lg text-lg" style={{ background: "#f59e0b18", color: "#f59e0b" }}>
                        {o.notes}
                      </p>
                    )}

                    <div className="text-sm mb-4" style={{ color: "#c0c0d8" }}>
                      <p className="font-medium text-[#f0f0ff]">{name}</p>
                      {o.fulfillment === "pickup" ? (
                        <p>🏪 Local pickup</p>
                      ) : o.shippingLine1 ? (
                        <>
                          <p>{o.shippingLine1}</p>
                          {o.shippingLine2 && <p>{o.shippingLine2}</p>}
                          <p>{o.shippingCity}, {o.shippingState} {o.shippingZip} {o.shippingCountry !== "US" ? o.shippingCountry : ""}</p>
                        </>
                      ) : (
                        <p>📦 Use the {o.channel} shipping label</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <form action={async () => {
                        "use server";
                        await markOrderPacked(o.id, !o.packedAt);
                      }}>
                        <button
                          type="submit"
                          className="w-full py-3 rounded-lg font-semibold"
                          style={o.packedAt
                            ? { background: "#13131e", color: "#8888aa", border: "1px solid #1e1e30" }
                            : { background: "#4ade8022", color: "#4ade80", border: "1px solid #4ade8066" }}
                        >
                          {o.packedAt ? "Undo packed" : "Packed ✓"}
                        </button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await markOrderShipped(o.id);
                      }}>
                        <button
                          type="submit"
                          className="w-full py-3 rounded-lg font-semibold text-white"
                          style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
                        >
                          Shipped →
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )
      )}

      {orders.length === 0 && (
        <p className="text-center py-10" style={{ color: "#8888aa" }}>All caught up. Nothing to pack.</p>
      )}
    </div>
  );
}
