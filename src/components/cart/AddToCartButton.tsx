"use client";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
type Props = { product: { id: string; name: string; slug: string; categorySlug: string; priceInCents: number; image?: string } };
export function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();
  const handleClick = () => { addItem(product); openCart(); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  return (
    <button onClick={handleClick} className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200" style={{ background: added ? "#4ade80" : "#a855f7", color: "#fff", boxShadow: added ? "0 0 20px rgba(74,222,128,0.4)" : "0 0 20px rgba(168,85,247,0.4)" }}>
      {added ? "✓ Added to Cart!" : "Add to Cart"}
    </button>
  );
}