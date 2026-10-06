// Whatnot Seller Hub show report (CSV) -> one packing order per shipment.
// Columns checked against real exports on 2026-10-06: order_id, product_name, product_quantity,
// original_item_price, placed_at, cancelled_or_failed, shipment_id, shipping_address, buyer_username.

export type ParsedItem = { name: string; quantity: number; priceCents: number };

export type ParsedOrder = {
  channelOrderId: string; // the Whatnot shipment id: a bundle of one buyer's items ships as one parcel
  buyer: string;
  placedAt: Date;
  items: ParsedItem[];
  address: {
    name: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
};

export type ParseResult = { orders: ParsedOrder[]; skipped: number; error?: string };

// Minimal RFC 4180 parser: quoted fields, doubled quotes, commas and newlines inside quotes.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f !== "")) rows.push(row);
  return rows;
}

// "Name, 12 Main St, Apt 4, CITY, ST, 12345, US": peel country/zip/state/city off the end,
// name off the front, whatever is left is the street.
function parseAddress(raw: string): ParsedOrder["address"] {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 6) return null;
  const country = parts.pop()!;
  const zip = parts.pop()!;
  const state = parts.pop()!;
  const city = parts.pop()!;
  const name = parts.shift()!;
  const line1 = parts.join(", ");
  if (!line1) return null;
  return { name, line1, city, state, zip, country };
}

export function parseWhatnotCsv(text: string): ParseResult {
  const rows = parseCsv(text);
  if (rows.length < 2) return { orders: [], skipped: 0, error: "That file has no rows." };
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => head.indexOf(name);
  const need = ["order_id", "product_name", "product_quantity", "original_item_price", "shipment_id"];
  const missing = need.filter((n) => col(n) < 0);
  if (missing.length) {
    return { orders: [], skipped: 0, error: `This does not look like a Whatnot show report. Missing columns: ${missing.join(", ")}.` };
  }
  const get = (r: string[], name: string) => (col(name) >= 0 ? (r[col(name)] ?? "").trim() : "");

  const byShipment = new Map<string, ParsedOrder>();
  let skipped = 0;
  for (const r of rows.slice(1)) {
    const cancelled = get(r, "cancelled_or_failed").toLowerCase();
    if (cancelled && cancelled !== "false" && cancelled !== "0") { skipped++; continue; }
    // A tracking code means a label was already bought and the parcel is handled.
    if (get(r, "tracking_code")) { skipped++; continue; }
    // Rows without a shipment id are listed on their own so nothing is silently lost.
    const key = get(r, "shipment_id") || `order-${get(r, "order_id")}`;
    let order = byShipment.get(key);
    if (!order) {
      const placed = new Date(get(r, "placed_at").replace(" ", "T") + "Z");
      order = {
        channelOrderId: key,
        buyer: get(r, "buyer_username"),
        placedAt: isNaN(placed.getTime()) ? new Date() : placed,
        items: [],
        address: parseAddress(get(r, "shipping_address")),
      };
      byShipment.set(key, order);
    }
    order.items.push({
      name: get(r, "product_name") || "Whatnot item",
      quantity: Math.max(1, parseInt(get(r, "product_quantity"), 10) || 1),
      priceCents: Math.round((parseFloat(get(r, "original_item_price")) || 0) * 100),
    });
  }
  return { orders: [...byShipment.values()], skipped };
}
