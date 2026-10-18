import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { addPackOrders } from "@/lib/packImport";
import type { PackOrder } from "@/lib/importers/packlist";

// Write-only drop for open orders read from the sales channels (used by the business folder's tools).
// Can only ADD packing orders. It cannot read, change, refund or delete anything.
export const dynamic = "force-dynamic";

const CHANNELS = ["whatnot", "mercari", "facebook", "tiktok_shop", "poshmark", "palmstreet", "offerup"];
const MAX_ORDERS = 300;
const MAX_ITEMS = 100;

function tokenOk(header: string | null): boolean {
  const expected = process.env.AGENT_WRITE_TOKEN ?? "";
  // No token configured on the server = endpoint is closed. A short token is refused too.
  if (expected.length < 32) return false;
  const given = (header ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Crude per-process limit: 20 requests a minute, whoever calls.
let windowStart = 0;
let count = 0;

export async function POST(req: Request) {
  const now = Date.now();
  if (now - windowStart > 60_000) { windowStart = now; count = 0; }
  if (++count > 20) return NextResponse.json({ error: "slow down" }, { status: 429 });

  if (!tokenOk(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (Number(req.headers.get("content-length") ?? 0) > 2_000_000) {
    return NextResponse.json({ error: "too big" }, { status: 413 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const list = (body as { orders?: unknown })?.orders;
  if (!Array.isArray(list) || list.length > MAX_ORDERS) {
    return NextResponse.json({ error: "orders must be a list of up to 300" }, { status: 400 });
  }

  const orders: PackOrder[] = [];
  for (const raw of list) {
    const o = raw as Record<string, unknown>;
    const channel = str(o.channel, 30).toLowerCase();
    const channelOrderId = str(o.channelOrderId, 80);
    const items = Array.isArray(o.items) ? o.items.slice(0, MAX_ITEMS) : [];
    if (!CHANNELS.includes(channel) || !channelOrderId || items.length === 0) {
      return NextResponse.json({ error: `bad order ${channel}/${channelOrderId}` }, { status: 400 });
    }
    const placed = new Date(str(o.placedAt, 40));
    orders.push({
      channel,
      channelOrderId,
      buyer: str(o.buyer, 80),
      buyerName: str(o.buyerName, 80),
      placedAt: isNaN(placed.getTime()) ? new Date() : placed,
      note: str(o.note, 300),
      items: items.map((i) => {
        const it = i as Record<string, unknown>;
        return {
          name: str(it.name, 200) || "Item",
          quantity: Math.min(999, Math.max(1, Math.trunc(Number(it.quantity)) || 1)),
          priceCents: Math.min(10_000_000, Math.max(0, Math.trunc(Number(it.priceCents)) || 0)),
        };
      }),
    });
  }

  const result = await addPackOrders(orders, "agent", "pushed_pack_order");
  revalidatePath("/admin/packing");
  revalidatePath("/admin/orders");
  return NextResponse.json(result);
}
