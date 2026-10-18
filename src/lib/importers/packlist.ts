// The business folder's orders/orders.csv -> one packing order per (channel, order_id).
// Only rows with status "open" count. Website (Stripe) orders never come from this file.
import { parseCsv } from "./whatnot";

export type PackItem = { name: string; quantity: number; priceCents: number };

export type PackOrder = {
  channel: string;
  channelOrderId: string;
  buyer: string;
  buyerName: string;
  placedAt: Date;
  note: string;
  items: PackItem[];
};

export type PackParse = { orders: PackOrder[]; skipped: number; error?: string };

const CHANNELS = ["whatnot", "mercari", "facebook", "tiktok_shop", "poshmark", "palmstreet", "offerup"];

// "Teresa Thurman (tthurman)" when both exist, otherwise whichever one there is.
function buyerLabel(name: string, handle: string): string | null {
  if (name && handle && name !== handle) return `Buyer: ${name} (${handle})`;
  const one = name || handle;
  return one ? `Buyer: ${one}` : null;
}

export function parsePackListCsv(text: string): PackParse {
  const rows = parseCsv(text);
  if (rows.length < 2) return { orders: [], skipped: 0, error: "That file has no rows." };
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const need = ["order_id", "channel", "title", "qty", "status"];
  const missing = need.filter((n) => head.indexOf(n) < 0);
  if (missing.length) {
    return { orders: [], skipped: 0, error: `This does not look like orders.csv. Missing columns: ${missing.join(", ")}.` };
  }
  const get = (r: string[], name: string) => (head.indexOf(name) >= 0 ? (r[head.indexOf(name)] ?? "").trim() : "");

  const byKey = new Map<string, PackOrder>();
  let skipped = 0;
  for (const r of rows.slice(1)) {
    const channel = get(r, "channel").toLowerCase();
    const orderId = get(r, "order_id");
    if (get(r, "status").toLowerCase() !== "open" || !CHANNELS.includes(channel) || !orderId) { skipped++; continue; }
    const key = `${channel}|${orderId}`;
    let order = byKey.get(key);
    if (!order) {
      const placed = new Date(get(r, "order_date"));
      const buyer = get(r, "buyer");
      const buyerName = get(r, "buyer_name");
      const shipBy = get(r, "ship_by");
      order = {
        channel,
        channelOrderId: orderId,
        buyer,
        buyerName,
        placedAt: isNaN(placed.getTime()) ? new Date() : placed,
        note: [buyerLabel(buyerName, buyer), shipBy ? `Ship by ${shipBy}` : null].filter(Boolean).join(" · "),
        items: [],
      };
      byKey.set(key, order);
    }
    order.items.push({
      name: get(r, "title") || get(r, "sku") || "Item",
      quantity: Math.max(1, parseInt(get(r, "qty"), 10) || 1),
      priceCents: Math.round((parseFloat(get(r, "item_price")) || 0) * 100),
    });
  }
  return { orders: [...byKey.values()], skipped };
}
