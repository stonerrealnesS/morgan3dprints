"use client";

import { useActionState } from "react";
import Link from "next/link";
import { importWhatnotCsv, type ImportState } from "./actions";

export default function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importWhatnotCsv, null);
  return (
    <form action={action} className="rounded-xl p-5 space-y-4" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
      <input type="file" name="file" accept=".csv,text/csv" required className="block w-full text-sm text-[#f0f0ff]" />
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
      >
        {pending ? "Importing…" : "Import Whatnot report"}
      </button>
      {state && (
        <p className="text-sm" style={{ color: state.ok ? "#4ade80" : "#ef4444" }} role="status">
          {state.message}{" "}
          {state.ok && <Link href="/admin/packing" className="underline">Open Packing</Link>}
        </p>
      )}
    </form>
  );
}
