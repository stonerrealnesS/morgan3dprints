"use client";

import { useState, useEffect } from "react";

export function EmailCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("emailPopupDismissed")) return;
    const t = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    localStorage.setItem("emailPopupDismissed", "1");
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSubmitted(true);
    localStorage.setItem("emailPopupDismissed", "1");
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{ background: "#0d0d14", border: "1px solid rgba(168,85,247,0.3)", boxShadow: "0 0 60px rgba(168,85,247,0.15)" }}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-lg leading-none"
          style={{ color: "#8888aa" }}
          aria-label="Close"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-[#f0f0ff] mb-2">You&apos;re in!</h2>
            <p className="text-sm mb-4" style={{ color: "#8888aa" }}>Use this code at checkout:</p>
            <div
              className="text-2xl font-mono font-bold tracking-widest py-3 px-6 rounded-xl mb-4"
              style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.4)", color: "#a855f7" }}
            >
              WELCOME10
            </div>
            <p className="text-xs" style={{ color: "#555570" }}>10% off your first order</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-3xl mb-3">✨</div>
              <h2 className="text-xl font-bold text-[#f0f0ff] mb-2">Get 10% off your first order</h2>
              <p className="text-sm" style={{ color: "#8888aa" }}>
                Join our list for exclusive discounts and new product drops.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
                style={{ background: "#13131e", border: "1px solid #1e1e30" }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all"
                style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)", boxShadow: "0 0 20px rgba(168,85,247,0.3)", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Saving…" : "Claim My 10% Off"}
              </button>
            </form>

            <button
              onClick={dismiss}
              className="w-full mt-3 text-xs text-center"
              style={{ color: "#555570" }}
            >
              No thanks
            </button>
          </>
        )}
      </div>
    </div>
  );
}
