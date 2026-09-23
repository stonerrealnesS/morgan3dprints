import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://morgan3dokc.com";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Google Merchant Center "free listings" product feed (RSS 2.0 + the g:
// namespace Google expects). Once the site is verified in Merchant Center,
// submitting this URL as a scheduled fetch is enough to get products showing
// in the Google Shopping tab / Search — no ad spend required. Mirrors the
// same in-stock, non-adult-category filter as sitemap.ts.
export async function GET() {
  const products = await prisma.product
    .findMany({
      where: { inStock: true, category: { isAdult: false } },
      select: {
        id: true,
        name: true,
        description: true,
        priceInCents: true,
        comparePriceInCents: true,
        slug: true,
        category: { select: { slug: true, name: true } },
        images: { orderBy: { isPrimary: "desc" }, take: 1, select: { url: true } },
      },
    })
    .catch(() => []);

  const items = products
    .map((p) => {
      const link = `${BASE}/shop/${p.category.slug}/${p.slug}`;
      const image = p.images[0]?.url;
      const price = (p.priceInCents / 100).toFixed(2);
      const onSale = p.comparePriceInCents !== null && p.comparePriceInCents > p.priceInCents;

      return `
    <item>
      <g:id>${p.id}</g:id>
      <title>${escapeXml(p.name)}</title>
      <description>${escapeXml(p.description.slice(0, 5000))}</description>
      <link>${escapeXml(link)}</link>
      ${image ? `<g:image_link>${escapeXml(image)}</g:image_link>` : ""}
      <g:availability>in stock</g:availability>
      ${
        onSale
          ? `<g:price>${(p.comparePriceInCents! / 100).toFixed(2)} USD</g:price>\n      <g:sale_price>${price} USD</g:sale_price>`
          : `<g:price>${price} USD</g:price>`
      }
      <g:condition>new</g:condition>
      <g:brand>Morgan 3D Prints</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${escapeXml(p.category.name)}</g:product_type>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Morgan 3D Prints — Product Feed</title>
    <link>${BASE}</link>
    <description>Custom 3D-printed products from Morgan 3D Prints, Oklahoma City.</description>${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
