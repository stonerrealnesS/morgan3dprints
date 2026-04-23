import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getProduct } from "@/lib/actions/products";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { AgeGateWrapper } from "@/components/shop/AgeGateWrapper";
import { ReviewForm } from "@/components/shop/ReviewForm";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const revalidate = 3600;

type ProductPageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true, category: { select: { slug: true } } },
    });
    return products.map((p) => ({ category: p.category.slug, slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];

  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDesc ?? product.description.slice(0, 160),
    openGraph: {
      title: product.metaTitle ?? product.name,
      description: product.metaDesc ?? product.description.slice(0, 160),
      ...(primaryImage?.url ? { images: [{ url: primaryImage.url, alt: product.name }] } : {}),
    },
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-4 h-4"
          style={{ color: star <= rating ? "#a855f7" : "#1e1e30" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 0-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      ))}
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { userId } = await auth();
  const product = await getProduct(slug);

  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: {
      category: { slug: product.category.slug },
      id: { not: product.id },
      OR: [{ inStock: true }, { isMadeToOrder: true }],
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, slug: true, priceInCents: true,
      isGlow: true, inStock: true, isMadeToOrder: true, material: true,
      category: { select: { id: true, name: true, slug: true } },
      images: { where: { isPrimary: true }, select: { url: true, isPrimary: true }, take: 1 },
    },
  });

  // Check if signed-in user has already reviewed this product
  let existingReview: { rating: number; body: string | null } | null = null;
  if (userId) {
    const customer = await prisma.customer.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });
    if (customer) {
      existingReview = await prisma.review.findUnique({
        where: { productId_customerId: { productId: product.id, customerId: customer.id } },
        select: { rating: true, body: true },
      });
    }
  }

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const otherImages = product.images.filter((img) => img !== primaryImage);

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.priceInCents / 100);

  const isAdultCategory = product.category.isAdult;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: primaryImage?.url,
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: (product.priceInCents / 100).toFixed(2),
        availability: product.inStock || product.isMadeToOrder
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: "Morgan 3D Prints" },
      },
      ...(avgRating !== null && product.reviews.length > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: avgRating.toFixed(1),
              reviewCount: product.reviews.length,
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Shop", item: "https://www.morgan3dokc.com/shop" },
        { "@type": "ListItem", position: 2, name: product.category.name, item: `https://www.morgan3dokc.com/shop/${product.category.slug}` },
        { "@type": "ListItem", position: 3, name: product.name },
      ],
    },
  ];

  return (
    <AgeGateWrapper requiresAgeGate={isAdultCategory}>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: "#8888aa" }}>
        <a href="/shop" className="hover:text-white transition-colors">Shop</a>
        <span>/</span>
        <a
          href={`/shop/${product.category.slug}`}
          className="hover:text-white transition-colors capitalize"
        >
          {product.category.name}
        </a>
        <span>/</span>
        <span style={{ color: "#f0f0ff" }}>{product.name}</span>
      </nav>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ─── Left: Image Gallery ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Primary image */}
          <div
            className="relative w-full aspect-square rounded-xl overflow-hidden"
            style={{ border: "1px solid #1e1e30" }}
          >
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.url}
                alt={primaryImage.alt ?? product.name}
                className="w-full h-full object-cover"
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
                  className="w-24 h-24 opacity-20"
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
          </div>

          {/* Thumbnails */}
          {otherImages.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {otherImages.map((img) => (
                <div
                  key={img.id}
                  className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ border: "1px solid #1e1e30" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt ?? product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Right: Product Info ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Name */}
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div
            className="text-4xl font-bold"
            style={{
              color: "#22d3ee",
              textShadow: "0 0 16px rgba(34,211,238,0.5)",
            }}
          >
            {formattedPrice}
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            {product.isGlow && (
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  background: "rgba(34,211,238,0.12)",
                  border: "1px solid rgba(34,211,238,0.5)",
                  color: "#22d3ee",
                  textShadow: "0 0 8px rgba(34,211,238,0.6)",
                }}
              >
                Glow ✦
              </span>
            )}

            {product.isMadeToOrder ? (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: "rgba(168,85,247,0.12)",
                  border: "1px solid rgba(168,85,247,0.4)",
                  color: "#a855f7",
                }}
              >
                Made to Order
              </span>
            ) : product.inStock ? (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
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
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                }}
              >
                Out of Stock
              </span>
            )}

            {product.material && (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: "#13131e",
                  border: "1px solid #1e1e30",
                  color: "#8888aa",
                }}
              >
                {product.material}
              </span>
            )}
          </div>

          {/* Lead time */}
          {(product.inStock || product.isMadeToOrder) && (
            <p className="text-xs" style={{ color: "#8888aa" }}>
              ⚡ {product.isMadeToOrder ? "Made to order — ships in 2–5 business days" : "In stock — ships in 2–5 business days"}
            </p>
          )}

          {/* Description */}
          <div
            className="text-base leading-relaxed whitespace-pre-line"
            style={{ color: "#8888aa" }}
          >
            {product.description}
          </div>

          {/* Add to Cart */}
          {product.inStock || product.isMadeToOrder ? (
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                categorySlug: product.category.slug,
                priceInCents: product.priceInCents,
                image: primaryImage?.url,
              }}
            />
          ) : (
            <button
              disabled
              className="w-full py-4 rounded-xl font-bold text-lg cursor-not-allowed"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "rgba(239,68,68,0.6)",
              }}
            >
              Out of Stock
            </button>
          )}

          {/* Custom order CTA */}
          <div
            className="flex items-center justify-between gap-3 p-4 rounded-xl"
            style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
          >
            <div>
              <p className="text-sm font-medium text-white">Want a different color or size?</p>
              <p className="text-xs mt-0.5" style={{ color: "#8888aa" }}>We can print this in any filament or customize it for you.</p>
            </div>
            <a
              href="/services/custom-order"
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)", color: "#a855f7" }}
            >
              Request custom →
            </a>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: "#1e1e30" }} />

          {/* Category link */}
          <p className="text-sm" style={{ color: "#8888aa" }}>
            Category:{" "}
            <a
              href={`/shop/${product.category.slug}`}
              className="hover:text-white transition-colors"
              style={{ color: "#a855f7" }}
            >
              {product.category.name}
            </a>
          </p>
        </div>
      </div>

      {/* ─── Reviews ────────────────────────────────────────────────────────── */}
      <section className="mt-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-white">Reviews</h2>
          {avgRating !== null && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm" style={{ color: "#8888aa" }}>
                {avgRating.toFixed(1)} ({product.reviews.length})
              </span>
            </div>
          )}
          <div
            className="flex-1 h-px"
            style={{
              background: "linear-gradient(to right, rgba(168,85,247,0.4), transparent)",
            }}
          />
        </div>

        {product.reviews.length === 0 ? (
          <div
            className="flex flex-col items-center py-16 rounded-xl gap-3"
            style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 opacity-30"
              style={{ color: "#a855f7" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
            <p className="font-medium" style={{ color: "#8888aa" }}>
              No reviews yet
            </p>
            <p className="text-sm" style={{ color: "#8888aa" }}>
              Be the first to review this product.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {product.reviews.map((review) => {
              const name = [review.customer.firstName, review.customer.lastName]
                .filter(Boolean)
                .join(" ") || "Anonymous";
              return (
                <div
                  key={review.id}
                  className="p-5 rounded-xl"
                  style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-white text-sm">{name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#8888aa" }}>
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.body && (
                    <p className="text-sm leading-relaxed" style={{ color: "#8888aa" }}>
                      {review.body}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Review form for signed-in users */}
        {userId ? (
          <div className="mt-6">
            <ReviewForm productId={product.id} existingReview={existingReview} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-center" style={{ color: "#8888aa" }}>
            <a href="/sign-in" style={{ color: "#a855f7" }}>Sign in</a> to leave a review
          </p>
        )}
      </section>
      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end gap-4 mb-8">
            <h2 className="text-2xl font-bold text-white">More from {product.category.name}</h2>
            <div className="flex-1 h-px mb-2" style={{ background: "linear-gradient(to right, rgba(168,85,247,0.4), transparent)" }} />
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
    </AgeGateWrapper>
  );
}
