"use client";

import { useEffect } from "react";

type PurchaseItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

type PurchaseTrackerProps = {
  transactionId: string;
  value: number;
  shipping?: number;
  items: PurchaseItem[];
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// Fires a GA4 "purchase" ecommerce event once per completed order, so
// Analytics can attribute real revenue (not just pageviews/visits) back to
// traffic sources — the thing actually needed to tell which SEO/Pinterest
// work is moving the $6k/month goal.
//
// Pushes straight onto window.dataLayer rather than calling window.gtag(...)
// directly: gtag.js loads with strategy="afterInteractive" in the root
// layout, so there's no guarantee it has finished loading by the time this
// effect runs on a fresh page load from the Stripe redirect. dataLayer.push
// is safe regardless of load order — gtag.js drains any events already
// queued in the array once it initializes.
//
// Guards against double-counting revenue if the customer refreshes or
// re-visits this confirmation page (sessionStorage flag keyed by order id).
export default function PurchaseTracker({
  transactionId,
  value,
  shipping,
  items,
}: PurchaseTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = `ga_purchase_${transactionId}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      // sessionStorage unavailable (privacy mode, etc) — fall through and
      // track anyway rather than silently dropping the event.
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "purchase",
      transaction_id: transactionId,
      value,
      currency: "USD",
      shipping,
      items,
    });

    try {
      sessionStorage.setItem(key, "1");
    } catch {
      // Best-effort only; if this throws, worst case is a possible
      // re-fire on refresh, which is an acceptable tradeoff.
    }
  }, [transactionId, value, shipping, items]);

  return null;
}
