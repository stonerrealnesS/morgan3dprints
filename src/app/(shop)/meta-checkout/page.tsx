import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MetaCartLoader, type MetaCartItem } from "@/components/cart/MetaCartLoader";

export const metadata: Metadata = {
  title: "Loading your cart",
  robots: { index: false, follow: false },
};

// Meta Shops checkout URL. Facebook/Instagram send buyers here as
// /meta-checkout?products=<id>:<qty>,<id>:<qty>&coupon=<code>
// The ids are the <g:id> values from /feed/google-shopping.xml (Product.id).
// We look the products up server-side, then the client loader replaces the
// browser cart with them and opens /cart. Prices always come from the DB again
// in /api/checkout, so nothing in this URL can change what the buyer pays.
type Props = {
  searchParams: Promise<{ products?: string; coupon?: string }>;
};

const MAX_LINES = 50;
const MAX_QTY = 99;

function parseProducts(raw: string | undefined) {
  const wanted = new Map<string, number>();
  if (!raw) return wanted;
  for (const part of raw.split(",").slice(0, MAX_LINES)) {
    const sep = part.lastIndexOf(":");
    const id = (sep === -1 ? part : part.slice(0, sep)).trim();
    const qty = sep === -1 ? 1 : parseInt(part.slice(sep + 1), 10);
    if (!id) continue;
    const safeQty = Number.isFinite(qty) ? Math.min(Math.max(qty, 1), MAX_QTY) : 1;
    wanted.set(id, Math.min((wanted.get(id) ?? 0) + safeQty, MAX_QTY));
  }
  return wanted;
}

export default async function MetaCheckoutPage({ searchParams }: Props) {
  const params = await searchParams;
  const wanted = parseProducts(params.products);
  const coupon = (params.coupon ?? "").trim().slice(0, 64);

  const products = wanted.size
    ? await prisma.product
        .findMany({
          where: { id: { in: [...wanted.keys()] }, inStock: true },
          select: {
            id: true,
            name: true,
            slug: true,
            priceInCents: true,
            category: { select: { slug: true } },
            images: { orderBy: { isPrimary: "desc" }, take: 1, select: { url: true } },
          },
        })
        .catch(() => [])
    : [];

  const items: MetaCartItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categorySlug: p.category.slug,
    priceInCents: p.priceInCents,
    image: p.images[0]?.url,
    quantity: wanted.get(p.id) ?? 1,
  }));

  return <MetaCartLoader items={items} coupon={coupon} missing={wanted.size - items.length} />;
}
