import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutBody = {
  items: CheckoutItem[];
  fulfillment: "pickup" | "ship";
  discreetPacking: boolean;
  discountCode?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();
    const { items, fulfillment, discreetPacking, discountCode } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // 1. Fetch prices from DB — never trust client prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, inStock: true },
      select: {
        id: true,
        name: true,
        priceInCents: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No valid products found" },
        { status: 400 }
      );
    }

    // 2. Build line items from DB prices
    type LineItem = { price_data: { currency: string; product_data: { name: string; images?: string[] }; unit_amount: number }; quantity: number };
    const lineItems: LineItem[] = [];
    const productIds_validated: string[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue; // skip out-of-stock or invalid

      productIds_validated.push(product.id);
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            ...(product.images[0]?.url
              ? { images: [product.images[0].url] }
              : {}),
          },
          unit_amount: product.priceInCents,
        },
        quantity: item.quantity,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: "No in-stock products found" },
        { status: 400 }
      );
    }

    // 3. Shipping line item if applicable
    if (fulfillment === "ship") {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Standard Shipping" },
          unit_amount: 899,
        },
        quantity: 1,
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (req.headers.get("origin") || "http://localhost:3000");

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      allow_promotion_codes: true,
      metadata: {
        fulfillment,
        discreetPacking: String(discreetPacking),
        productIds: JSON.stringify(productIds_validated),
        discountCode: discountCode ?? "",
      },
      success_url: `${baseUrl}/order/{CHECKOUT_SESSION_ID}/confirmation`,
      cancel_url: `${baseUrl}/cart`,
      ...(fulfillment === "ship"
        ? {
            shipping_address_collection: {
              allowed_countries: ["US"],
            },
          }
        : {}),
    });

    // 5. Return the Stripe redirect URL
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
