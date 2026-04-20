"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";

function fmt(cents: number) { return "$" + (cents / 100).toFixed(2); }
const SHIPPING_CENTS = 899;

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, fulfillment, discreetPacking, setFulfillment, setDiscreetPacking, subtotalCents, clearCart } = useCartStore();
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { useCartStore.persist.rehydrate(); setHydrated(true); }, []);

  if (!hydrated) return null;
  if (items.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">🛒</div>
      <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
      <Link href="/shop" className="mt-4 px-6 py-3 rounded-xl font-semibold text-white" style={{ background: "#a855f7" }}>Shop Now</Link>
    </div>
  );

  const shipping = fulfillment === "ship" ? SHIPPING_CENTS : 0;
  const total = subtotalCents() + shipping;

  const checkout = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(i => ({ productId: i.id, quantity: i.quantity })), fulfillment, discreetPacking }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      clearCart();
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 p-5 rounded-xl" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
              <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #1a0a2e, #0d1a2e)" }}>
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{item.name}</p>
                <p className="text-sm font-bold mt-1" style={{ color: "#a855f7" }}>{fmt(item.priceInCents)} each</p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg text-white font-bold" style={{ background: "#1e1e30" }}>−</button>
                  <span className="text-white font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg text-white font-bold" style={{ background: "#1e1e30" }}>+</button>
                  <button onClick={() => removeItem(item.id)} className="ml-auto text-sm text-[#8888aa] hover:text-[#ec4899] transition-colors">Remove</button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{fmt(item.priceInCents * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          {/* Fulfillment */}
          <div className="p-5 rounded-xl" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
            <p className="text-white font-semibold mb-3">Delivery Method</p>
            {(["ship", "pickup"] as const).map(f => (
              <label key={f} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2" style={{ background: fulfillment === f ? "rgba(168,85,247,0.15)" : "transparent", border: `1px solid ${fulfillment === f ? "#a855f7" : "#1e1e30"}` }}>
                <input type="radio" name="fulfillment" value={f} checked={fulfillment === f} onChange={() => setFulfillment(f)} className="accent-purple-500" />
                <div>
                  <p className="text-white text-sm font-medium">{f === "ship" ? "Ship to me" : "Local Pickup (OKC)"}</p>
                  <p className="text-[#8888aa] text-xs">{f === "ship" ? `$${(SHIPPING_CENTS/100).toFixed(2)} flat rate` : "Free — pick up in OKC"}</p>
                </div>
              </label>
            ))}
            <label className="flex items-center gap-3 mt-2 cursor-pointer">
              <input type="checkbox" checked={discreetPacking} onChange={e => setDiscreetPacking(e.target.checked)} className="accent-purple-500 w-4 h-4" />
              <span className="text-[#8888aa] text-sm">Discreet packaging</span>
            </label>
          </div>

          {/* Order summary */}
          <div className="p-5 rounded-xl space-y-3" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
            <p className="text-white font-semibold">Order Summary</p>
            <div className="flex justify-between text-[#8888aa] text-sm"><span>Subtotal</span><span className="text-white">{fmt(subtotalCents())}</span></div>
            <div className="flex justify-between text-[#8888aa] text-sm"><span>Shipping</span><span className="text-white">{shipping === 0 ? "Free" : fmt(shipping)}</span></div>
            <div className="h-px" style={{ background: "#1e1e30" }} />
            <div className="flex justify-between font-bold text-lg"><span className="text-white">Total</span><span style={{ color: "#22d3ee" }}>{fmt(total)}</span></div>
            {error && <p className="text-sm" style={{ color: "#ec4899" }}>{error}</p>}
            <button onClick={checkout} disabled={loading} className="w-full py-4 rounded-xl font-bold text-white transition-all" style={{ background: loading ? "#555" : "#a855f7", boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}>
              {loading ? "Redirecting..." : "Pay with Stripe →"}
            </button>
            <p className="text-[#8888aa] text-xs text-center">Powered by Stripe · Secure checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
