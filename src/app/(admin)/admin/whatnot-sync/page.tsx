"use client";

import { useState } from "react";
import Link from "next/link";
import { syncWhatnotProducts, type WhatnotSyncItem, type WhatnotSyncResult } from "@/lib/actions/admin";

const WHATNOT_SHOP_URL = "https://www.whatnot.com/user/morgan_3d_prints/shop";

// This page used to listen for a postMessage from the bookmarklet's tab via
// window.opener. That doesn't work: Whatnot's server sends
// `Cross-Origin-Opener-Policy: same-origin-allow-popups`, which severs
// window.opener on any cross-origin popup opened onto whatnot.com, no matter
// how the tab is opened (confirmed directly against their response headers).
// So instead, the bookmarklet copies its results to the clipboard, and this
// page reads them back with the "Paste Results" button below.
type Status =
  | { kind: "idle" }
  | { kind: "saving"; count: number }
  | { kind: "done"; result: WhatnotSyncResult }
  | { kind: "error"; message: string };

export default function WhatnotSyncPage() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function startSync() {
    const win = window.open(WHATNOT_SHOP_URL, "_blank");
    if (!win) {
      setStatus({ kind: "error", message: "Your browser blocked the popup. Please allow popups for this site and try again." });
    }
  }

  async function pasteResults() {
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      setStatus({
        kind: "error",
        message: 'Couldn’t read your clipboard. In the bookmarklet panel, click "Copy Results" first, then try Paste Results again.',
      });
      return;
    }

    let items: WhatnotSyncItem[];
    try {
      items = JSON.parse(text);
    } catch {
      setStatus({
        kind: "error",
        message: 'That doesn’t look like synced results. Click "Copy Results" in the bookmarklet panel, then try Paste Results again.',
      });
      return;
    }

    if (!Array.isArray(items) || !items.length) {
      setStatus({ kind: "error", message: 'No items found in your clipboard. Click "Copy Results" in the bookmarklet panel first.' });
      return;
    }

    setStatus({ kind: "saving", count: items.length });
    syncWhatnotProducts(items)
      .then((result) => setStatus({ kind: "done", result }))
      .catch((err) =>
        setStatus({ kind: "error", message: err instanceof Error ? err.message : "Sync failed." })
      );
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
          <li><span className="text-[#f0f0ff] font-semibold">2.</span> In that tab, click your installed <span className="text-[#f0f0ff]">🦆 Whatnot Sync</span> bookmarklet. It filters your shop to Buy It Now listings automatically — then scroll down through the page yourself to load and collect every item (Whatnot only loads more as a real person scrolls).</li>
          <li><span className="text-[#f0f0ff] font-semibold">3.</span> Once the &quot;Items found&quot; count looks complete, click <span className="text-[#f0f0ff]">Copy Results</span> in that panel.</li>
          <li><span className="text-[#f0f0ff] font-semibold">4.</span> Come back to this tab and click <span className="text-[#f0f0ff]">Paste Results</span> below.</li>
        </ol>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={startSync}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #fb923c 0%, #f472b6 100%)" }}
          >
            Start Sync
          </button>
          <button
            onClick={pasteResults}
            disabled={status.kind === "saving"}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: "#1a1a2e", color: "#f0f0ff", border: "1px solid #2a2a3e" }}
          >
            {status.kind === "saving" ? "Saving…" : "Paste Results"}
          </button>
        </div>

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
        Haven&apos;t installed the bookmarklet yet?{" "}
        <Link href="/admin/whatnot-sync/install" className="text-[#a855f7] hover:underline">
          Install it here
        </Link>{" "}
        — dragging it into your bookmarks bar only needs to be done once.
      </p>
    </div>
  );
}
