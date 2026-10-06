"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, type CartItem } from "@/lib/store/cart";

export type MetaCartItem = CartItem;

type Props = { items: MetaCartItem[]; coupon: string; missing: number };

// Replaces the browser cart with what the buyer picked on Facebook/Instagram,
// then sends them to /cart. The coupon (if any) rides along so the cart page
// can show it; Stripe checkout already has a promo code box.
export function MetaCartLoader({ items, coupon, missing }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) return;
    useCartStore.persist.rehydrate();
    const { clearCart, addItem, updateQuantity } = useCartStore.getState();
    clearCart();
    for (const { quantity, ...item } of items) {
      addItem(item);
      updateQuantity(item.id, quantity);
    }
    const query = new URLSearchParams();
    if (coupon) query.set("coupon", coupon);
    if (missing > 0) query.set("missing", String(missing));
    const qs = query.toString();
    router.replace(qs ? `/cart?${qs}` : "/cart");
  }, [items, coupon, missing, router]);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-white mb-2">That item isn&apos;t available right now</h1>
        <p className="text-[#8888aa] mb-4">It may have sold out. Have a look at what&apos;s in stock.</p>
        <Link href="/shop" className="px-6 py-3 rounded-xl font-semibold text-white" style={{ background: "#a855f7" }}>Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-[#8888aa]">Loading your cart…</div>
  );
}
