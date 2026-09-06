"use client";

import { useEffect, useRef, useState } from "react";
import { syncWhatnotProducts, type WhatnotSyncItem, type WhatnotSyncResult } from "@/lib/actions/admin";

const WHATNOT_SHOP_URL = "https://www.whatnot.com/user/morgan_3d_prints/shop";
const WHATNOT_ORIGIN = "https://www.whatnot.com";

type Status =
  | { kind: "idle" }
| { kind: "waiting" }
| { kind: "saving"; count: number }
| { kind: "done"; result: WhatnotSyncResult }
| { kind: "error"; message: string };

export default function WhatnotSyncPage() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const whatnotWindow = useRef<Window | null>(null);

useEffect(() => {
  function onMessage(event: MessageEvent) {
    if (event.origin !== WHATNOT_ORIGIN) return;
    const data = event.data as { type?: string; items?: WhatnotSyncItem[] };
    if (!data || data.type !== "whatnot-sync-result") return;

  const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
      setStatus({ kind: "error", message: "The Whatnot Sync bookmarklet didn't find any items." });
      return;
    }

  setStatus({ kind: "saving", count: items.length });
    syncWhatnotProducts(items)
    .then((result) => setStatus({ kind: "done", result }))
    .catch((err) =>
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Sync failed." })
           );
  }

          window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}, []);

function startSync() {
  whatnotWindow.current = window.open(WHATNOT_SHOP_URL, "_blank");
  if (!whatnotWindow.current) {
    setStatus({ kind: "error", message: "Your browser blocked the popup. Please allow popups for this site and try again." });
    return;
  }
  setStatus({ kind: "waiting" });
}

return (
  <div className="max-w-2xl">
  <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">🦆 Sync with Whatnot</h1>
  <p className="text-sm mb-8" style={{ color: "#8888aa" }}>
  Pulls your current Buy It Now listings from Whatnot into the shop. Items no longer
  on Whatnot are marked out of stock (not deleted), so past orders and reviews stay intact.
  </p>
  
  <div className="rounded-xl p-6 mb-6" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
  <ol className="space-y-3 text-sm mb-6" style={{ color: "#8888aa" }}>
  <li><span className="text-[#f0f0ff] font-semibold">1.</span> Click &quot;Start Sync&quot; below — it opens your Whatnot shop in a new tab.</li>
  <li><span className="text-[#f0f0ff] font-semibold">2.</span> In that tab, click your installed <span className="text-[#f0f0ff]">🦆 Whatnot Sync</span> bookmarklet, then <span className="text-[#f0f0ff]">Start</span>. It scrolls through your shop reading every Buy It Now listing.</li>
  <li><span className="text-[#f0f0ff] font-semibold">3.</span> When it says &quot;looks complete,&quot; click <span className="text-[#f0f0ff]">Send to Admin Dashboard</span> — this page updates and saves automatically.</li>
  </ol>
  
  <button
    onClick={startSync}
    disabled={status.kind === "waiting" || status.kind === "saving"}
    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
    style={{ background: "linear-gradient(135deg, #fb923c 0%, #f472b6 100%)" }}
    >
    {status.kind === "waiting" ? "Waiting for Whatnot tab…" : status.kind === "saving" ? "Saving…" : "Start Sync"}
  </button>
  
    {status.kind === "waiting" && (
    <p className="text-xs mt-4" style={{ color: "#8888aa" }}>
    Waiting for the bookmarklet to send its results back to this tab. Don&apos;t close this page.
    </p>
  )}
    {status.kind === "saving" && (
    <p className="text-xs mt-4" style={{ color: "#8888aa" }}>
    Got {status.count} item{status.count !== 1 ? "s" : ""} from Whatnot — saving to the shop…
    </p>
  )}
    {status.kind === "done" && (
    <div className="mt-4 px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80" }}>
    Synced ✓ — {status.result.created} new, {status.result.updated} updated
      {status.result.hiddenCount > 0 && `, ${status.result.hiddenCount} marked out of stock (no longer on Whatnot)`}.
    </div>
  )}
    {status.kind === "error" && (
    <div className="mt-4 px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444" }}>
      {status.message}
    </div>
  )}
  </div>
  
  <p className="text-xs" style={{ color: "#555570" }}>
  Haven&apos;t installed the bookmarklet yet? Ask for the install page/link — dragging it into your
  bookmarks bar only needs to be done once.
  </p>
  </div>
  );
}
