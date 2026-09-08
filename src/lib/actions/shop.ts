"use server";

// Thin server-action wrapper around getProducts so client components (the
// infinite-scroll product grid) can fetch additional pages without a public
// API route. getProducts itself has no "use server" directive — it's a plain
// cached data-fetcher meant to be called from Server Components — so this is
// the bridge that lets the browser ask for "page 2, 3, 4…" as the user scrolls.

import { getProducts, type GetProductsOptions, type GetProductsResult } from "@/lib/actions/products";

export async function loadMoreProducts(
  options: GetProductsOptions
): Promise<GetProductsResult> {
  return getProducts(options);
}
