import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Morgan 3D Prints — a locally owned 3D print farm in OKC / Mustang / Yukon serving businesses, makers, engineers, and individuals.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-xs uppercase tracking-widest text-[#a78bfa] mb-3">About Morgan 3D Prints</p>
        <h1 className="text-4xl font-bold mb-4">
          A local print farm built for{" "}
          <span className="text-[#a78bfa]">real projects, not just hobby prints.</span>
        </h1>
        <p className="text-[#a0a0b8] max-w-2xl mb-6">
          Morgan 3D Prints started as a way to turn &quot;wouldn&apos;t it be cool if…&quot; ideas into real,
          physical products. Today it&apos;s a small but mighty print farm in the OKC / Mustang / Yukon
          area helping teams, small businesses, makers, and friends bring their ideas to life.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-[#a0a0b8]">
          <span className="border border-white/10 rounded-full px-3 py-1.5">Engineer-run shop with real-world manufacturing background</span>
          <span className="border border-white/10 rounded-full px-3 py-1.5">Tuned for reliability, repeatability, and detail</span>
          <span className="border border-white/10 rounded-full px-3 py-1.5">Flexible for one-off prototypes and product runs</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-16">
        <div className="border border-white/10 rounded-2xl bg-white/5 p-5">
          <p className="text-xs text-[#a0a0b8] mb-1">Lead times</p>
          <p className="text-xl font-bold text-[#a78bfa]">2–5 days</p>
          <p className="text-xs text-[#a0a0b8] mt-1">Honest, not over-promised</p>
        </div>
        <div className="border border-white/10 rounded-2xl bg-white/5 p-5">
          <p className="text-xs text-[#a0a0b8] mb-1">Location</p>
          <p className="text-xl font-bold text-[#a78bfa]">OKC Area</p>
          <p className="text-xs text-[#a0a0b8] mt-1">Pickup or US shipping</p>
        </div>
        <div className="border border-white/10 rounded-2xl bg-white/5 p-5">
          <p className="text-xs text-[#a0a0b8] mb-1">Approach</p>
          <p className="text-xl font-bold text-[#a78bfa]">Custom-first</p>
          <p className="text-xs text-[#a0a0b8] mt-1">No template-only mindset</p>
        </div>
      </div>

      {/* Who we are */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">Who we are & who we help</h2>
        <p className="text-[#a0a0b8] text-sm mb-6">
          At the end of the day, it&apos;s about making useful, fun, and memorable parts for real people — not cranking out anonymous junk.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-white/10 rounded-2xl bg-white/5 p-6 text-sm text-[#a0a0b8]">
            <p className="mb-4">
              Morgan 3D Prints grew out of an engineering and manufacturing background,
              so things like tolerances, materials, and &quot;will this actually hold up?&quot; are baked into how we think.
            </p>
            <ul className="space-y-2">
              {[
                "Locally owned, with roots in OKC / Mustang / Yukon.",
                "Comfortable talking shop with engineers, maintenance, and fabricators.",
                "Equally happy helping a small brand make their first batch of merch.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-white/10 rounded-2xl bg-white/5 p-6 text-sm text-[#a0a0b8]">
            <p className="mb-4">A few of the people we regularly work with:</p>
            <ul className="space-y-2">
              {[
                "Small businesses that want branded keychains, signage, and countertop displays.",
                "Sports teams, schools, and churches that need custom swag or fundraiser items.",
                "Engineers and makers needing fixtures, adapters, test parts, or prototype enclosures.",
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

      {/* How we work */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">How we like to work</h2>
        <p className="text-[#a0a0b8] text-sm mb-6">
          Clear communication, honest pricing, and enough iteration to get things right without dragging the project on forever.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              step: "1",
              title: "Share your idea",
              items: [
                "Send a rough sketch, existing file, or even just a paragraph of what you need.",
                "If you already have CAD, awesome. If not, we can help model it.",
                "We'll ask a few questions about size, use case, and quantity.",
              ],
            },
            {
              step: "2",
              title: "We design, test, and iterate",
              items: [
                "We choose materials and print settings based on how the part will actually be used.",
                "For functional parts, we'll often print a test piece before a larger run.",
                "Once you're happy, we'll lock in pricing for the full batch.",
              ],
            },
            {
              step: "3",
              title: "Production on the print farm",
              items: [
                "We run multiple printers in parallel to keep turnarounds reasonable.",
                "Parts are inspected, cleaned up, and sorted before pickup or shipping.",
                "Need reorders later? We can keep your files and settings on hand.",
              ],
            },
            {
              step: "4",
              title: "Local-first, but we do ship",
              items: [
                "Local pickup in the OKC area is always an option.",
                "We can ship orders anywhere in the US, with free shipping over $35.",
                "If you're planning recurring orders, we can talk about long-term pricing.",
              ],
            },
          ].map((block) => (
            <div key={block.step} className="border border-white/10 rounded-2xl bg-white/5 p-6 text-sm text-[#a0a0b8]">
              <p className="font-semibold text-white mb-3">{block.step}. {block.title}</p>
              <ul className="space-y-2">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="rounded-2xl border border-[#a78bfa]/30 bg-[#a78bfa]/5 p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Let&apos;s build something cool.</h2>
        <p className="text-[#a0a0b8] text-sm mb-6">Serving OKC & beyond — pickup or shipping available.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/services/custom-order"
            className="px-6 py-3 rounded-full bg-[#a78bfa] text-black text-sm font-semibold hover:bg-[#c4b5fd] transition-colors"
          >
            Start a custom order
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 rounded-full border border-[#a78bfa] text-[#a78bfa] text-sm font-semibold hover:bg-[#a78bfa]/10 transition-colors"
          >
            Browse the shop
          </Link>
        </div>
      </div>
    </main>
  );
}
