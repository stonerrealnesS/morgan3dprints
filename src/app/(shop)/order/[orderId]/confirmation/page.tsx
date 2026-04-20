import Link from "next/link";
import { prisma } from "@/lib/prisma";

type ConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
};

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function OrderConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { orderId } = await params;

  // Try to fetch the order — webhook may still be processing
  const order = await prisma.order.findUnique({
    where: { stripeSessionId: orderId },
    include: { items: true },
  }).catch(() => null);

  const shortId = orderId.slice(-8).toUpperCase();

  // Generic confirmed state if webhook hasn't fired yet
  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Green check */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "rgba(74,222,128,0.10)",
            border: "2px solid rgba(74,222,128,0.4)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-12 h-12"
            style={{ color: "#4ade80" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>

        <h1
          className="text-3xl font-extrabold mb-3"
          style={{
            color: "#4ade80",
            textShadow: "0 0 24px rgba(74,222,128,0.4)",
          }}
        >
          Order Confirmed!
        </h1>
        <p className="text-[#8888aa] mb-2 max-w-md">
          Thank you for your purchase. Your order is being processed and you
          will receive a confirmation email shortly.
        </p>
        <p className="text-sm text-[#8888aa] mb-8">
          Order reference:{" "}
          <span className="text-[#f0f0ff] font-mono">#{shortId}</span>
        </p>

        <Link
          href="/shop"
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
            boxShadow: "0 0 20px rgba(168,85,247,0.35)",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isPickup = order.fulfillment === "pickup";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-10">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "rgba(74,222,128,0.10)",
            border: "2px solid rgba(74,222,128,0.4)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-12 h-12"
            style={{ color: "#4ade80" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h1
          className="text-3xl font-extrabold mb-2"
          style={{
            color: "#4ade80",
            textShadow: "0 0 24px rgba(74,222,128,0.4)",
          }}
        >
          Your Order is Confirmed!
        </h1>
        <p className="text-[#8888aa]">
          Order{" "}
          <span className="text-[#f0f0ff] font-mono">
            #{order.id.slice(-8).toUpperCase()}
          </span>
        </p>
      </div>

      {/* Order card */}
      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}
      >
        {/* Items */}
        <div style={{ borderBottom: "1px solid #1e1e30" }}>
          <div className="px-5 py-3">
            <h2 className="text-sm font-semibold text-[#8888aa] uppercase tracking-wide">
              Items
            </h2>
          </div>
          <ul>
            {order.items.map((item, idx) => (
              <li
                key={item.id}
                className="flex items-center gap-4 px-5 py-4"
                style={
                  idx < order.items.length - 1
                    ? { borderTop: "1px solid #1e1e30" }
                    : {}
                }
              >
                {item.imageSnapshot && (
                  <div
                    className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{ border: "1px solid #1e1e30" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageSnapshot}
                      alt={item.nameSnapshot}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f0f0ff] truncate">
                    {item.nameSnapshot}
                  </p>
                  <p className="text-xs text-[#8888aa]">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#f0f0ff] flex-shrink-0">
                  {formatCents(item.priceSnapshot * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8888aa]">Subtotal</span>
            <span className="text-[#f0f0ff]">
              {formatCents(order.subtotalCents)}
            </span>
          </div>
          {order.shippingCents > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8888aa]">Shipping</span>
              <span className="text-[#f0f0ff]">
                {formatCents(order.shippingCents)}
              </span>
            </div>
          )}
          {order.discountCents > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8888aa]">Discount</span>
              <span style={{ color: "#4ade80" }}>
                -{formatCents(order.discountCents)}
              </span>
            </div>
          )}
          <div
            className="h-px my-1"
            style={{ background: "#1e1e30" }}
          />
          <div className="flex justify-between font-bold">
            <span className="text-[#f0f0ff]">Total</span>
            <span
              style={{
                color: "#22d3ee",
                textShadow: "0 0 10px rgba(34,211,238,0.4)",
              }}
            >
              {formatCents(order.totalCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Fulfillment info */}
      <div
        className="rounded-xl p-5 mb-8"
        style={{ border: "1px solid #1e1e30", background: "#0d0d14" }}
      >
        <h2 className="text-sm font-semibold text-[#8888aa] uppercase tracking-wide mb-3">
          Fulfillment
        </h2>
        {isPickup ? (
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(168,85,247,0.12)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
                style={{ color: "#a855f7" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#f0f0ff]">Local Pickup — OKC</p>
              <p className="text-sm text-[#8888aa] mt-0.5">
                We&apos;ll contact you when your order is ready. Estimated
                ready in 3–5 business days.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(34,211,238,0.10)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
                style={{ color: "#22d3ee" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#f0f0ff]">Shipped to Your Address</p>
              {order.shippingLine1 && (
                <p className="text-sm text-[#8888aa] mt-0.5">
                  {order.shippingLine1}
                  {order.shippingLine2 ? `, ${order.shippingLine2}` : ""},{" "}
                  {order.shippingCity}, {order.shippingState}{" "}
                  {order.shippingZip}
                </p>
              )}
              <p className="text-sm text-[#8888aa] mt-1">
                Estimated delivery: 5–10 business days
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Link
          href="/shop"
          className="px-8 py-3 rounded-xl font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
            boxShadow: "0 0 20px rgba(168,85,247,0.35)",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
