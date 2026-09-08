"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { loadMoreProducts } from "@/lib/actions/shop";
import type { ProductSummary } from "@/lib/actions/products";

type InfiniteProductGridProps = {
  initialProducts: ProductSummary[];
  initialPage: number;
  totalPages: number;
  limit: number;
  categorySlug?: string;
  search?: string;
};

// Replaces "Previous / Next" pagination: loads the next page automatically
// once the sentinel div at the bottom of the grid scrolls into view. The
// parent should pass a `key` derived from the active filters (search,
// category) so this component fully remounts (and resets to page 1) when
// the filters change, rather than trying to append page 2 of a stale query.
export function InfiniteProductGrid({
  initialProducts,
  initialPage,
  totalPages,
  limit,
  categorySlug,
  search,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialPage < totalPages);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || loadingRef.current) return;
        loadingRef.current = true;
        const nextPage = page + 1;
        startTransition(async () => {
          try {
            const result = await loadMoreProducts({
              categorySlug: categorySlug || undefined,
              search: search || undefined,
              page: nextPage,
              limit,
            });
            setProducts((prev) => [...prev, ...result.products]);
            setPage(nextPage);
            setHasMore(nextPage < result.totalPages);
          } finally {
            loadingRef.current = false;
          }
        });
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, page, categorySlug, search, limit]);

  return (
    <>
      <ProductGrid products={products} />
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-10" aria-hidden={!isPending}>
          {isPending && (
            <span className="text-sm" style={{ color: "#8888aa" }}>
              Loading more…
            </span>
          )}
        </div>
      )}
    </>
  );
}
