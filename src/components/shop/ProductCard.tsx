"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProductSummary } from "@/lib/actions/products";

type ProductCardProps = {
  product: ProductSummary;
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const href = `/shop/${product.category.slug}/${product.slug}`;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Link href={href} className="block h-full group">
        <div
          className="h-full flex flex-col rounded-xl border border-[#1e1e30] transition-all duration-200 overflow-hidden group-hover:border-[#a855f7]/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          style={{ background: "#0d0d14" }}
        >
          {/* Image */}
          <div className="relative w-full aspect-square overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #1a0a2e 0%, #0d1a2e 50%, #0a1a20 100%)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-12 h-12 opacity-20"
                  style={{ color: "#a855f7" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
              </div>
            )}

            {/* Glow badge */}
            {product.isGlow && (
              <div
                className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(34,211,238,0.15)",
                  border: "1px solid rgba(34,211,238,0.5)",
                  color: "#22d3ee",
                  textShadow: "0 0 8px rgba(34,211,238,0.8)",
                }}
              >
                Glow ✦
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4 gap-2">
            {/* Name */}
            <h3 className="font-bold text-white leading-snug line-clamp-2 group-hover:text-[#a855f7] transition-colors">
              {product.name}
            </h3>

            {/* Material */}
            {product.material && (
              <p className="text-xs" style={{ color: "#8888aa" }}>
                {product.material}
              </p>
            )}

            {/* Price + badges row */}
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-lg font-bold"
                  style={{ color: "#22d3ee", textShadow: "0 0 8px rgba(34,211,238,0.5)" }}
                >
                  {formatPrice(product.priceInCents)}
                </span>
                {product.comparePriceInCents && product.comparePriceInCents > product.priceInCents && (
                  <span className="text-sm line-through" style={{ color: "#555570" }}>
                    {formatPrice(product.comparePriceInCents)}
                  </span>
                )}
              </div>

              {/* Stock badge */}
              {product.isMadeToOrder ? (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(168,85,247,0.15)",
                    border: "1px solid rgba(168,85,247,0.4)",
                    color: "#a855f7",
                  }}
                >
                  Made to Order
                </span>
              ) : product.inStock ? (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.4)",
                    color: "#4ade80",
                  }}
                >
                  In Stock
                </span>
              ) : (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#ef4444",
                  }}
                >
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
