import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Morgan 3D Prints — a home-based 3D print shop in OKC / Mustang / Yukon known for rubber ducks and fun prints on Whatnot, plus custom orders for makers and small businesses.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-xs uppercase tracking-widest text-[#a78bfa] mb-3">About Morgan 3D Prints</p>
        <h1 className="text-4xl font-bold mb-4">
          The rubber duck people —{" "}
          <span className="text-[#a78bfa]">who also happen to print pretty much anything.</span>
        </h1>
        <p className="text-[#a0a0b8] max-w-2xl mb-6">
          Morgan 3D Prints started as a way to turn &quot;wouldn&apos;t it be cool if…&quot; ideas into real,
          physical products — and somewhere along the way, the multicolor 3D printed rubber ducks we sell
          live on Whatnot became the thing people know us for. We&apos;re a small, home-based print shop in
          the OKC / Mustang / Yukon area, running a fleet of printers to keep up with both the fun stuff and
          the serious stuff.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-[#a0a0b8]">
          <span className="border border-white/10 rounded-full px-3 py-1.5">🦆 Home of the Whatnot rubber ducks</span>
          <span className="border border-white/10 rounded-full px-3 py-1.5">Hundreds of ready-to-ship pieces</span>
          <span className="border border-white/10 rounded-full px-3 py-1.5">Also does real custom &amp; engineering work</span>
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
              Most days that means running the print farm for our Whatnot shop — rubber ducks, glow-in-the-dark
              wall art, fidgets, keychains, and whatever weird idea comes up next. If you&apos;ve caught one of
              our livestreams, this is that shop.
            </p>
            <ul className="space-y-2">
              {[
                "Locally owned, with roots in OKC / Mustang / Yukon.",
                "Hundreds of ready-to-ship pieces, restocked constantly.",
                "New drops go live on Whatnot before they ever hit the site.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-white/10 rounded-2xl bg-white/5 p-6 text-sm text-[#a0a0b8]">
            <p className="mb-4">
              We also grew out of an engineering and manufacturing background, so when a request needs real
              tolerances and &quot;will this actually hold up?&quot; thinking, we can do that too:
            </p>
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
