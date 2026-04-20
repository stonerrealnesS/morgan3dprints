import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}

export async function POST(req: NextRequest) {
  // 1. Get raw body — NOT req.json()
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 2. Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutCompleted(session, event.id);
    } catch (err) {
      console.error("[stripe-webhook] handleCheckoutCompleted error:", err);
      // Still return 200 so Stripe doesn't retry indefinitely for logic errors
      return NextResponse.json({ received: true });
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripeEventId: string
) {
  const sessionId = session.id;

  // a. Idempotency check — skip if order already exists for this session
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
  });
  if (existing) {
    console.log(
      `[stripe-webhook] order already exists for session ${sessionId}, skipping`
    );
    return;
  }

  // b. Parse metadata
  const metadata = session.metadata ?? {};
  const fulfillment = (metadata.fulfillment as "pickup" | "ship") ?? "ship";
  const discreetPacking = metadata.discreetPacking === "true";
  const productIdsRaw = metadata.productIds ?? "[]";
  const productIds: string[] = JSON.parse(productIdsRaw);

  // c. Retrieve line items from Stripe (source of truth for amounts)
  const lineItemsResponse = await stripe.checkout.sessions.listLineItems(
    sessionId,
    { expand: ["data.price.product"] }
  );
  const lineItems = lineItemsResponse.data;

  // d. Fetch products from DB for snapshots
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
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
  const productMap = new Map(products.map((p) => [p.id, p]));

  // e. Calculate amounts
  const amountTotal = session.amount_total ?? 0;
  const shippingCents = fulfillment === "ship" ? 899 : 0;
  const subtotalCents = amountTotal - shippingCents;
  const discountCents = session.total_details?.amount_discount ?? 0;

  // f. Shipping address from session
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shippingDetails = (session as any).shipping_details as { address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string } } | null;
  const addr = shippingDetails?.address;

  // g. Look up customer by email
  const email = session.customer_details?.email ?? session.customer_email;
  let customerId: string | null = null;
  if (email) {
    const customer = await prisma.customer.findUnique({
      where: { email },
      select: { id: true },
    });
    customerId = customer?.id ?? null;
  }

  // h. Build order items from line items
  const orderItemsData = lineItems
    .filter((li) => {
      // Exclude shipping line item
      const productName =
        typeof li.price?.product === "object" &&
        li.price.product !== null &&
        "name" in li.price.product
          ? (li.price.product as Stripe.Product).name
          : "";
      return productName !== "Standard Shipping";
    })
    .map((li) => {
      const productName =
        typeof li.price?.product === "object" &&
        li.price.product !== null &&
        "name" in li.price.product
          ? (li.price.product as Stripe.Product).name
          : li.description ?? "Product";

      // Try to find DB product for image snapshot
      const matchedProduct = products.find((p) => p.name === productName);
      const imageSnapshot = matchedProduct?.images[0]?.url ?? null;
      const productId =
        productIds.find((id) => productMap.get(id)?.name === productName) ??
        null;

      return {
        productId,
        nameSnapshot: productName,
        priceSnapshot: li.price?.unit_amount ?? 0,
        quantity: li.quantity ?? 1,
        imageSnapshot,
      };
    });

  // i. Create Order + OrderItems in DB
  const order = await prisma.order.create({
    data: {
      stripeSessionId: sessionId,
      stripeEventId,
      customerId,
      guestEmail: customerId ? null : email,
      fulfillment,
      discreetPacking,
      subtotalCents,
      shippingCents,
      discountCents,
      totalCents: amountTotal,
      status: "PROCESSING",
      shippingLine1: addr?.line1 ?? null,
      shippingLine2: addr?.line2 ?? null,
      shippingCity: addr?.city ?? null,
      shippingState: addr?.state ?? null,
      shippingZip: addr?.postal_code ?? null,
      shippingCountry: addr?.country ?? null,
      items: {
        create: orderItemsData,
      },
    },
    include: { items: true },
  });

  // j. Decrement stock (set inStock=false for physical items, simplified)
  for (const pid of productIds) {
    await prisma.product.update({
      where: { id: pid },
      data: { inStock: false },
    }).catch(() => {
      // Product may have been deleted — ignore
    });
  }

  // k. Send order confirmation email
  if (email) {
    try {
      await getResend().emails.send({
        from: "Morgan 3D Prints <orders@morgan3dokc.com>",
        to: email,
        subject: `Order Confirmed — #${order.id.slice(-8).toUpperCase()}`,
        react: OrderConfirmationEmail({
          orderId: order.id,
          items: order.items.map((item) => ({
            name: item.nameSnapshot,
            quantity: item.quantity,
            priceInCents: item.priceSnapshot,
            image: item.imageSnapshot ?? undefined,
          })),
          totalCents: order.totalCents,
          fulfillment: order.fulfillment as "pickup" | "ship",
          shippingAddress:
            fulfillment === "ship" && addr
              ? `${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city}, ${addr.state} ${addr.postal_code}`
              : undefined,
        }),
      });
    } catch (emailErr) {
      console.error("[stripe-webhook] failed to send confirmation email:", emailErr);
      // Don't throw — order is already saved
    }
  }

  console.log(`[stripe-webhook] order ${order.id} created for session ${sessionId}`);
}
