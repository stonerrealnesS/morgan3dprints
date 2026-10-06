"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseWhatnotCsv } from "@/lib/importers/whatnot";

export type ImportState = { message: string; ok: boolean } | null;

async function requireAdmin() {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!userId || !adminIds.includes(userId)) redirect("/sign-in");
  return userId;
}

// Safe to upload the same file twice: a shipment already in the database is skipped.
export async function importWhatnotCsv(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const adminUserId = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a CSV file first." };
  if (file.size > 5_000_000) return { ok: false, message: "That file is too big for a show report." };

  const parsed = parseWhatnotCsv(await file.text());
  if (parsed.error) return { ok: false, message: parsed.error };

  const existing = await prisma.order.findMany({
    where: { channel: "whatnot", channelOrderId: { in: parsed.orders.map((o) => o.channelOrderId) } },
    select: { channelOrderId: true },
  });
  const have = new Set(existing.map((e) => e.channelOrderId));
  const fresh = parsed.orders.filter((o) => !have.has(o.channelOrderId));

  for (const o of fresh) {
    const subtotal = o.items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
    await prisma.order.create({
      data: {
        channel: "whatnot",
        channelOrderId: o.channelOrderId,
        // Paid on Whatnot already; PROCESSING keeps it off the "check it is paid" warning.
        status: "PROCESSING",
        createdAt: o.placedAt,
        subtotalCents: subtotal,
        totalCents: subtotal,
        // Orders have no recipient-name field, so the name goes in the note the packing card shows.
        notes: [o.address ? `Ship to: ${o.address.name}` : null, o.buyer ? `Whatnot buyer: ${o.buyer}` : null]
          .filter(Boolean)
          .join(" · ") || null,
        shippingLine1: o.address?.line1,
        shippingCity: o.address?.city,
        shippingState: o.address?.state,
        shippingZip: o.address?.zip,
        shippingCountry: o.address?.country,
        items: {
          create: o.items.map((i) => ({ nameSnapshot: i.name, priceSnapshot: i.priceCents, quantity: i.quantity })),
        },
        adminActions: {
          create: { adminUserId, action: "imported_whatnot_csv", entityType: "Order", entityId: o.channelOrderId },
        },
      },
    });
  }

  revalidatePath("/admin/packing");
  revalidatePath("/admin/orders");
  return {
    ok: true,
    message: `Added ${fresh.length} to pack. Skipped ${have.size} already in the list and ${parsed.skipped} cancelled or already-labelled item${parsed.skipped === 1 ? "" : "s"}.`,
  };
}
