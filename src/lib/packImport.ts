import { prisma } from "@/lib/prisma";
import type { PackOrder } from "@/lib/importers/packlist";

// Adds each order to the packing list unless that channel + order id is already there.
// Never touches an existing order, so a repeat push cannot undo "packed" or change items.
export async function addPackOrders(orders: PackOrder[], actor: string, action: string) {
  if (orders.length === 0) return { added: 0, already: 0 };
  const existing = await prisma.order.findMany({
    where: { OR: orders.map((o) => ({ channel: o.channel, channelOrderId: o.channelOrderId })) },
    select: { channel: true, channelOrderId: true },
  });
  const have = new Set(existing.map((e) => `${e.channel}|${e.channelOrderId}`));
  const fresh = orders.filter((o) => !have.has(`${o.channel}|${o.channelOrderId}`));

  for (const o of fresh) {
    const subtotal = o.items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
    await prisma.order.create({
      data: {
        channel: o.channel,
        channelOrderId: o.channelOrderId,
        status: "PROCESSING", // paid on the channel already
        createdAt: o.placedAt,
        subtotalCents: subtotal,
        totalCents: subtotal,
        notes: o.note || null,
        items: { create: o.items.map((i) => ({ nameSnapshot: i.name, priceSnapshot: i.priceCents, quantity: i.quantity })) },
        adminActions: { create: { adminUserId: actor, action, entityType: "Order", entityId: o.channelOrderId } },
      },
    });
  }
  return { added: fresh.length, already: have.size };
}
