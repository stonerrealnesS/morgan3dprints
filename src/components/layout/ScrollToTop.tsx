"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Next.js kept the old scroll position when opening a product from the long
// shop list, so the item page opened near its footer. Jump to the top whenever
// the page changes (unless the link points at a #section).
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
