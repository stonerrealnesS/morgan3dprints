import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Print by the Hour — Morgan 3D Prints",
  description: "Rent our 3D printers by the hour for your own projects. Filament included. OKC-based.",
};

const tiers = [
  {
    name: "Prototype",
    price: "$15",
    unit: "/ 1 hour",
    desc: "Quick test prints and simple single-color prototypes.",
    features: ["1 hour of print time", "File prep included", "Single color", "Standard PLA filament", "Local pickup or $8.99 shipping"],
    cta: "Book Prototype",
    color: "#8888aa",
  },
  {
    name: "Single Hour",
    price: "$25",
    unit: "/ 1 hour",
    desc: "More color options and filament choices for polished prints.",
    features: ["1 hour of print time", "File prep included", "Up to 4 colors", "Standard & Matte PLA filament", "Local pickup or $8.99 shipping"],
    cta: "Book Single Hour",
    color: "#22d3ee",
  },
  {
    name: "2 Hours",
    price: "$35",
    unit: "/ 2 hours",
    desc: "More time for larger or more detailed pieces.",
    features: ["2 hours of print time", "File prep included", "Up to 4 colors", "Standard & Matte PLA filament", "Free USPS shipping"],
    cta: "Book 2 Hours",
    color: "#ec4899",
  },
  {
    name: "Half Day",
    price: "$50",
    unit: "/ 4 hours",
    desc: "Best value for medium projects with full filament access.",
    features: ["4 hours of print time", "File prep included", "Up to 8 colors", "Standard, Matte & Specialty PLA filament", "Free USPS shipping"],
    cta: "Book Half Day",
    color: "#a855f7",
    featured: true,
  },
  {
    name: "Full Day",
    price: "$90",
    unit: "/ 8 hours",
    desc: "Large prints and small production runs.",
    features: ["8 hours of print time", "File prep included", "Up to 8 colors", "Standard, Matte & Specialty PLA filament", "Free USPS shipping"],
    cta: "Book Full Day",
    color: "#a855f7",
  },
  {
    name: "Double Shift",
    price: "$150",
    unit: "/ 16 hours",
    desc: "Maximum print time with priority queue for serious production runs.",
    features: ["16 hours of print time", "File prep for up to 4 build plates", "Priority printing queue", "Up to 8 colors", "Standard, Matte & Specialty PLA filament", "Free USPS shipping"],
    cta: "Book Double Shift",
    color: "#22d3ee",
  },
];

export default function PrintByTheHourPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-sm font-mono mb-3" style={{ color: "#a855f7" }}>Print by the Hour</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#f0f0ff] leading-tight mb-4">
          Your ideas, our printers
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "#8888aa" }}>
          Have an STL file ready to go? Book time on our printers — filament included,
          no membership required.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="rounded-2xl p-7 flex flex-col"
            style={{
              background: tier.featured ? "linear-gradient(160deg, #1a0a2e 0%, #0d1428 100%)" : "#0d0d14",
              border: `1px solid ${tier.featured ? "rgba(168,85,247,0.5)" : "#1e1e30"}`,
              boxShadow: tier.featured ? "0 0 40px rgba(168,85,247,0.12)" : "none",
            }}
          >
            {tier.featured && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-full mb-4 self-start"
                style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7" }}
              >
                Most Popular
              </span>
            )}
            <p className="font-bold text-[#f0f0ff] mb-1">{tier.name}</p>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-4xl font-extrabold" style={{ color: tier.color }}>{tier.price}</span>
              <span className="text-sm mb-1" style={{ color: "#8888aa" }}>{tier.unit}</span>
            </div>
            <p className="text-sm mb-6" style={{ color: "#8888aa" }}>{tier.desc}</p>
            <ul className="space-y-2 flex-1 mb-6">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#8888aa" }}>
                  <span style={{ color: tier.color }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/services/custom-order"
              className="block text-center py-3 rounded-xl font-semibold text-sm transition-all"
              style={
                tier.featured
                  ? { background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)", color: "#fff", boxShadow: "0 0 20px rgba(168,85,247,0.3)" }
                  : { background: "#13131e", color: tier.color, border: `1px solid ${tier.color}44` }
              }
            >
              {tier.cta} →
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-[#f0f0ff] mb-6 text-center">Common questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What file formats do you accept?",
              a: "We work with STL, 3MF, OBJ, and STEP files. If you have something else, reach out and we'll figure it out.",
            },
            {
              q: "What filament types are available?",
              a: "PLA, PETG, and TPU in a wide range of colors. Specialty filaments (glow-in-the-dark, silk, woodfill) may have an upcharge.",
            },
            {
              q: "How do I know how long my print will take?",
              a: "Upload your file via the custom order form and we'll give you a time estimate before you pay anything.",
            },
            {
              q: "Can I pick up my prints?",
              a: "Yes — OKC local pickup is always free. We also ship within the US for flat $8.99.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl p-5" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
              <p className="font-semibold text-[#f0f0ff] mb-2">{q}</p>
              <p className="text-sm leading-relaxed" style={{ color: "#8888aa" }}>{a}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/services/custom-order"
            className="inline-block px-8 py-3.5 rounded-xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)", boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
          >
            Request a booking →
          </Link>
        </div>
      </div>
    </div>
  );
}
