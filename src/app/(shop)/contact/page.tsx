import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Morgan 3D Prints — OKC's local 3D printing studio. Email us, submit a custom order, or stop by for local pickup.",
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest text-[#a78bfa] mb-3">Get in touch</p>
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-[#a0a0b8] max-w-xl">
          Have a question, custom project idea, or just want to say hi? We&apos;re a small local shop
          and we actually read every message.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Email */}
        <div className="border border-white/10 rounded-2xl bg-white/5 p-6">
          <p className="text-xs uppercase tracking-widest text-[#a78bfa] mb-3">Email</p>
          <p className="text-xl font-semibold mb-2">morgan3dokc@gmail.com</p>
          <p className="text-sm text-[#a0a0b8] mb-4">
            Best for custom project quotes, bulk orders, and anything that needs back-and-forth.
            We typically respond within 1 business day.
          </p>
          <a
            href="mailto:morgan3dokc@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a78bfa] text-black text-sm font-semibold hover:bg-[#c4b5fd] transition-colors"
          >
            Send an email
          </a>
        </div>

        {/* Custom order form */}
        <div className="border border-[#a78bfa]/30 rounded-2xl bg-[#a78bfa]/5 p-6">
          <p className="text-xs uppercase tracking-widest text-[#a78bfa] mb-3">Custom Order Form</p>
          <p className="text-xl font-semibold mb-2">Start a project</p>
          <p className="text-sm text-[#a0a0b8] mb-4">
            Use our custom order form to describe what you need. We&apos;ll review it and send back
            a quote with timeline and pricing.
          </p>
          <Link
            href="/services/custom-order"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#a78bfa] text-[#a78bfa] text-sm font-semibold hover:bg-[#a78bfa]/10 transition-colors"
          >
            Submit a custom order →
          </Link>
        </div>
      </div>

      {/* Location & pickup */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">Location & Local Pickup</h2>
        <p className="text-[#a0a0b8] text-sm mb-6">
          We&apos;re based in the OKC / Mustang / Yukon area. Local pickup is always free — we&apos;ll
          coordinate a time that works once your order is ready.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Area", value: "OKC / Mustang / Yukon, Oklahoma" },
            { label: "Pickup", value: "Free — by appointment" },
            { label: "Shipping", value: "US only — $8.99 flat, free over $35" },
          ].map((item) => (
            <div key={item.label} className="border border-white/10 rounded-xl bg-white/5 p-4">
              <p className="text-xs text-[#a0a0b8] mb-1">{item.label}</p>
              <p className="text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social / other */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Other ways to reach us</h2>
        <p className="text-[#a0a0b8] text-sm mb-6">
          Quick questions? You can also message us on social media.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.tiktok.com/@morgan3dokc"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full border border-white/10 text-sm text-[#a0a0b8] hover:text-white hover:border-white/30 transition-colors"
          >
            TikTok @morgan3dokc
          </a>
          <a
            href="https://www.instagram.com/morgan3dokc"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full border border-white/10 text-sm text-[#a0a0b8] hover:text-white hover:border-white/30 transition-colors"
          >
            Instagram @morgan3dokc
          </a>
        </div>
      </section>
    </main>
  );
}
