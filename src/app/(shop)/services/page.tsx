import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description: "Custom 3D printing services in OKC — merch, prototypes, fixtures, signage, short-run manufacturing, and more. Local pickup or US shipping.",
};

const categories = [
  {
    title: "Custom Merch & Branded Items",
    description:
      "Great for teams, creators, small businesses, and events. We can incorporate logos, QR codes, text, and team names into physical items.",
    items: [
      "Keychains, locker tags, bag tags, and backpack charms.",
      "Booth / table signage, QR code stands, and small displays.",
      "Trophies, awards, and small \"thank you\" gifts.",
    ],
    tags: ["Color-matched where possible", "Team / logo integration"],
  },
  {
    title: "Prototyping, Fixtures & Functional Parts",
    description:
      "If you're trying to solve a mechanical problem, test an idea, or hold something in place, this is the lane. Expect practical questions about fits, loads, and how it will be used.",
    items: [
      "Assembly jigs, inspection fixtures, and test adapters.",
      "Sensor mounts, brackets, wire guides, and clip-on parts.",
      "Enclosures, spacers, standoffs, and prototype housings.",
    ],
    tags: ["Dimensional focus", "Engineer-to-engineer feedback"],
  },
  {
    title: "Signage & Display Pieces",
    description:
      "Need your logo as a physical object? We can turn it into a countertop display, wall sign, or multi-layer piece that really pops.",
    items: [
      "Desk logos and "name bar" style signage.",
      "Wall-mount logos with standoffs or screw bosses.",
      "QR-based signs for menus, socials, or tip links.",
    ],
    tags: ["Layered color designs", "Mounting hardware options"],
  },
  {
    title: "Short-Run Manufacturing & Fulfillment",
    description:
      "Already selling products and just need a reliable source for 3D printed parts? We can act as a mini-factory behind the scenes.",
    items: [
      "Ongoing batches of parts for your own products or kits.",
      "Labeling, simple assembly, and bagging options available.",
      "We'll track settings so repeat runs are consistent.",
    ],
    tags: ["No huge MOQs", "Reorder-friendly"],
  },
];

export default function ServicesPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-xs uppercase tracking-widest text-[#a78bfa] mb-3">What we can help with</p>
        <h1 className="text-4xl font-bold mb-4">
          From <span className="text-[#a78bfa]">custom merch</span> to{" "}
          <span className="text-[#a78bfa]">engineering fixtures</span> and beyond.
        </h1>
        <p className="text-[#a0a0b8] max-w-2xl mb-6">
          Morgan 3D Prints blends &quot;fun stuff&quot; (keychains, swag, signage) with
          practical parts (fixtures, jigs, adapters, brackets). If it can be
          modeled and reasonably printed, we&apos;ll help you figure out a way to make it.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-[#a0a0b8]">
          <span className="border border-white/10 rounded-full px-3 py-1.5">Short-run friendly (1–1000+ pieces)</span>
          <span className="border border-white/10 rounded-full px-3 py-1.5">In-house design and file cleanup</span>
          <span className="border border-white/10 rounded-full px-3 py-1.5">Local pickup or US shipping</span>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4 mb-16">
        <Link
          href="/services/custom-order"
          className="flex items-center justify-between gap-4 border border-[#a78bfa]/40 rounded-2xl bg-[#a78bfa]/5 p-6 hover:bg-[#a78bfa]/10 transition-colors group"
        >
          <div>
            <p className="font-semibold mb-1">Submit a Custom Order</p>
            <p className="text-sm text-[#a0a0b8]">Tell us what you need — we&apos;ll get back with a quote.</p>
          </div>
          <span className="text-[#a78bfa] text-xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        <Link
          href="/services/print-by-the-hour"
          className="flex items-center justify-between gap-4 border border-white/10 rounded-2xl bg-white/5 p-6 hover:bg-white/10 transition-colors group"
        >
          <div>
            <p className="font-semibold mb-1">Print by the Hour</p>
            <p className="text-sm text-[#a0a0b8]">Flat-rate print time — bring your own file.</p>
          </div>
          <span className="text-[#a0a0b8] text-xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Core categories */}
      <section className="mb-16">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Core service categories</h2>
            <p className="text-[#a0a0b8] text-sm">Most projects land in one of these buckets. If yours doesn&apos;t, no worries — we&apos;re pretty flexible.</p>
          </div>
          <a
            href="mailto:morgan3dokc@gmail.com?subject=3D%20Printing%20Service%20Inquiry"
            className="shrink-0 px-4 py-2 rounded-full border border-white/10 text-sm text-[#a0a0b8] hover:text-white hover:border-white/30 transition-colors"
          >
            Ask about your project
          </a>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.title} className="border border-white/10 rounded-2xl bg-white/5 p-6">
              <h3 className="font-semibold text-white mb-2">{cat.title}</h3>
              <p className="text-sm text-[#a0a0b8] mb-4">{cat.description}</p>
              <ul className="space-y-1.5 mb-4">
                {cat.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-[#a0a0b8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {cat.tags.map((tag) => (
                  <span key={tag} className="text-xs border border-white/10 rounded-full px-2.5 py-1 text-[#a0a0b8]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Materials & Files */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">Materials, file types, and what we work with</h2>
        <p className="text-[#a0a0b8] text-sm mb-6">
          You don&apos;t have to be a CAD expert to start a project, but if you are, we&apos;re happy to meet you there.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-white/10 rounded-2xl bg-white/5 p-6 text-sm text-[#a0a0b8]">
            <p className="font-semibold text-white mb-3">Common materials we use</p>
            <ul className="space-y-2">
              {[
                { name: "PLA & PLA+", desc: "General-purpose, great surface finish, tons of color options." },
                { name: "PETG", desc: "Better heat and impact resistance, good for light-duty functional parts." },
                { name: "TPU (flexible)", desc: "For gaskets, bumpers, and impact-absorbing pieces." },
                { name: "Specialty filaments", desc: "Glow-in-the-dark, silk, matte, and more — ask about your project." },
              ].map((m) => (
                <li key={m.name} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                  <span><strong className="text-white">{m.name}:</strong> {m.desc}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-white/10 rounded-2xl bg-white/5 p-6 text-sm text-[#a0a0b8]">
            <p className="font-semibold text-white mb-3">Files & starting points</p>
            <ul className="space-y-2">
              {[
                "CAD files: STEP, IGES, STL, OBJ are all workable starting points.",
                "No file? No problem. We can work from measurements, sketches, or inspiration photos.",
                "Logos: vector files (SVG, AI, EPS, PDF) are ideal for signage and keychains.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">Pricing & turnaround expectations</h2>
        <p className="text-[#a0a0b8] text-sm mb-6">
          We keep pricing straightforward and try to be very clear up-front so there are no surprises.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-white/10 rounded-2xl bg-white/5 p-6 text-sm text-[#a0a0b8]">
            <p className="font-semibold text-white mb-3">What affects price?</p>
            <ul className="space-y-2">
              {[
                "Size of the part and how long it takes to print.",
                "Material choice and infill / strength requirements.",
                "Quantity and whether the design is one-time or recurring.",
                "Any extra design / modeling work needed to get to a printable file.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-white/10 rounded-2xl bg-white/5 p-6 text-sm text-[#a0a0b8]">
            <p className="font-semibold text-white mb-3">Typical timelines</p>
            <ul className="space-y-2">
              {[
                "Small orders: usually 2–5 business days once designs are locked in.",
                "Large batches or complex fixtures may take longer (we'll quote honestly).",
                "Rush options may be possible depending on current print queue.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="rounded-2xl border border-[#a78bfa]/30 bg-[#a78bfa]/5 p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Ready to start a project?</h2>
        <p className="text-[#a0a0b8] text-sm mb-6">
          Reach out with your idea — even a rough description is enough to get started.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/services/custom-order"
            className="px-6 py-3 rounded-full bg-[#a78bfa] text-black text-sm font-semibold hover:bg-[#c4b5fd] transition-colors"
          >
            Submit a custom order
          </Link>
          <a
            href="mailto:morgan3dokc@gmail.com"
            className="px-6 py-3 rounded-full border border-[#a78bfa] text-[#a78bfa] text-sm font-semibold hover:bg-[#a78bfa]/10 transition-colors"
          >
            Email us directly
          </a>
        </div>
      </div>
    </main>
  );
}
