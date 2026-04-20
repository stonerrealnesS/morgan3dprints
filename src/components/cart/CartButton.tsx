"use client";
import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { CartDrawer } from "./CartDrawer";
export function CartButton() {
  const { openCart, itemCount } = useCartStore();
  useEffect(() => { useCartStore.persist.rehydrate(); }, []);
  const count = itemCount();
  return (
    <>
      <button onClick={openCart} className="relative w-8 h-8 flex items-center justify-center text-[#8888aa] hover:text-[#f0f0ff] cursor-pointer transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
        {count > 0 && (<span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-white text-[10px] font-bold rounded-full" style={{ background: "#ec4899" }}>{count > 9 ? "9+" : count}</span>)}
      </button>
      <CartDrawer />
    </>
  );
}