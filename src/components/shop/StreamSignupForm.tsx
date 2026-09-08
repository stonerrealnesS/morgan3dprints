"use client";

import { useState } from "react";

export function StreamSignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/stream-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p className="text-sm font-medium" style={{ color: "#4ade80" }}>
        🎉 You&apos;re on the list — we&apos;ll email you before the next stream.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="flex-1 px-4 py-3 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
        style={{ background: "#13131e", border: "1px solid #1e1e30" }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-3 rounded-lg font-bold text-white text-sm whitespace-nowrap transition-all"
        style={{ background: status === "loading" ? "#555" : "#a855f7" }}
      >
        {status === "loading" ? "Signing up…" : "Notify Me"}
      </button>
      {status === "error" && (
        <p className="text-xs" style={{ color: "#ec4899" }}>Something went wrong — try again?</p>
      )}
    </form>
  );
}
