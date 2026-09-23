import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Morgan 3D Prints' return and refund policy — return window, eligible items, custom order exceptions, and how to start a return.",
};

const sections = [
  {
    heading: "Return Window",
    body: "You have 14 days from the date your order is delivered (or picked up) to request a return or exchange. Items must be unused and in their original condition.",
  },
  {
    heading: "Custom & Made-to-Order Items",
    body: "Most of our catalog is printed to order. Because these pieces are made specifically for your order, custom and made-to-order items are final sale and cannot be returned for a change of mind. If a custom or made-to-order item arrives defective or damaged, it's fully covered — see below.",
  },
  {
    heading: "Damaged or Defective Items",
    body: "If your order arrives damaged, defective, or not as described, contact us within 14 days of delivery. We'll replace the item or issue a full refund, including any shipping you paid — no return shipping cost to you.",
  },
  {
    heading: "Return Shipping Costs",
    body: "For an eligible return that isn't defective or damaged (a change of mind on an in-stock, non-custom item), the customer covers return shipping. We'll provide the return address once your return is approved.",
  },
  {
    heading: "Refunds",
    body: "Once we receive and inspect a returned item, we'll process your refund to your original payment method within a few business days. You'll get an email once it's issued. Exchanges for a different item, size, or color follow the same process.",
  },
  {
    heading: "How to Start a Return",
    body: "Email us at morgan3dokc@gmail.com with your order number and the reason for the return. We'll walk you through the next steps.",
  },
];

export default function ReturnsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest text-[#a78bfa] mb-3">Policy</p>
        <h1 className="text-4xl font-bold mb-4">Returns & Refunds</h1>
        <p className="text-[#a0a0b8] max-w-2xl">
          We want you to be happy with your order. Here&apos;s how returns, exchanges, and refunds
          work at Morgan 3D Prints.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.heading} className="border-b border-white/10 pb-8 last:border-b-0">
            <h2 className="text-lg font-semibold text-[#c4b5fd] mb-3">{section.heading}</h2>
            <p className="text-sm text-[#a0a0b8] leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-[#a78bfa]/30 bg-[#a78bfa]/5 p-8">
        <h2 className="text-xl font-semibold mb-2">Questions about a return?</h2>
        <p className="text-[#a0a0b8] text-sm mb-4">
          Reach out any time and we&apos;ll help sort it out.
        </p>
        <a
          href="mailto:morgan3dokc@gmail.com"
          className="inline-block px-5 py-2.5 rounded-full bg-[#a78bfa] text-black text-sm font-semibold hover:bg-[#c4b5fd] transition-colors"
        >
          Email us
        </a>
      </div>
    </main>
  );
}
