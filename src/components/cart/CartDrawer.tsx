"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";

function fmt(cents: number) { return "$" + (cents / 100).toFixed(2); }

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, subtotalCents } = useCartStore();
  useEffect(() => { useCartStore.persist.rehydrate(); }, []);
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.7)" }} />
          <motion.div key="dr" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col" style={{ background: "#0d0d14", borderLeft: "1px solid #1e1e30" }}>
            <div className="flex items-center justify-between p-6 border-b border-[#1e1e30]">
              <h2 className="text-xl font-bold text-white">Cart {items.length > 0 && <span style={{ color: "#a855f7" }}>({items.reduce((s, i) => s + i.quantity, 0)})</span>}</h2>
              <button onClick={closeCart} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8888aa] hover:text-white" style={{ background: "#1e1e30" }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-[#8888aa]">Your cart is empty</p>
                  <button onClick={closeCart} className="mt-4 text-sm" style={{ color: "#a855f7" }}>Continue shopping</button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl" style={{ background: "#13131e", border: "1px solid #1e1e30" }}>
                    <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #1a0a2e, #0d1a2e)" }}>
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{item.name}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: "#a855f7" }}>{fmt(item.priceInCents)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded text-white text-xs font-bold" style={{ background: "#1e1e30" }}>−</button>
                        <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded text-white text-xs font-bold" style={{ background: "#1e1e30" }}>+</button>
                        <button onClick={() => removeItem(item.id)} className="ml-auto text-xs text-[#8888aa] hover:text-[#ec4899] transition-colors">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div className="p-6 border-t border-[#1e1e30] space-y-4">
                <div className="flex justify-between text-white font-semibold"><span>Subtotal</span><span>{fmt(subtotalCents())}</span></div>
                <Link href="/cart" onClick={closeCart} className="block w-full py-4 text-center rounded-xl font-bold text-white" style={{ background: "#a855f7", boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}>Checkout →</Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
