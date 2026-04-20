import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about 3D printing, custom orders, pricing, and working with Morgan 3D Prints in OKC.",
};

const faqs = [
  {
    section: "General 3D Printing",
    items: [
      { q: "What is 3D printing?", a: "3D printing is an additive manufacturing process that creates objects layer by layer from a digital 3D model. It allows highly customized, complex items to be made quickly and affordably." },
      { q: "How does 3D printing work?", a: "A digital 3D model is sliced into thin layers by software. The printer melts plastic filament and deposits it layer by layer until the final object is complete." },
      { q: "What are 3D printers used for?", a: "Almost anything: prototypes and replacement parts, toys, tools, art, custom gifts, educational models, business products, and more. 3D printing is used in engineering, manufacturing, medical, architecture, hobbies, and schools." },
      { q: "What materials can be used?", a: "Common materials include PLA, PETG, ABS/ASA, TPU (flexible), and specialty filaments like glow-in-the-dark, metallic, silk, or wood-filled. Each material has different strengths and ideal uses." },
      { q: "How strong are 3D printed objects?", a: "Strength depends on the material and how the item is designed. Many prints are durable enough for everyday use, displays, hardware, brackets, and functional parts. We can help choose the right material for your use case." },
      { q: "How long does a 3D print take?", a: "Prints can take anywhere from minutes to multiple hours depending on size, detail, and complexity. Small items might finish in under 20 minutes, while large pieces may take many hours or overnight." },
      { q: "Is 3D printing expensive?", a: "Not typically. Costs are mainly based on material, time, and design complexity. For custom or low-volume items, 3D printing is often cheaper and faster than traditional manufacturing methods." },
      { q: "Is 3D printing eco-friendly?", a: "PLA (the most common filament) is plant-based and biodegradable under industrial composting conditions. We also minimize waste where possible." },
      { q: "Can 3D printed items be used outdoors or in heat?", a: "PLA can soften in high heat, such as a hot car or direct summer sun. PETG, ASA, and ABS are better choices for outdoor use or higher temperatures. We can recommend the right material for your project." },
      { q: "How accurate is 3D printing?", a: "Modern printers can produce details as small as about 0.08 mm (thinner than a sheet of paper), depending on the geometry and material." },
      { q: "Can 3D printers make moving parts?", a: "Yes. With proper design, hinges, gears, and functional mechanisms can be printed as a single part that already moves right off the printer — these are called \"print-in-place\" designs." },
    ],
  },
  {
    section: "Custom Design & Modeling",
    items: [
      { q: "Do you offer custom 3D modeling?", a: "Yes — we provide full in-house 3D modeling to help turn almost any idea into a ready-to-print file. You don't have to be a CAD expert to work with us." },
      { q: "What if I don't have a design or 3D model?", a: "No problem at all. Many customers start with a sketch, a photo, a sample part, or just a description. We'll ask a few questions and create the model from scratch." },
      { q: "Do you offer graphic design?", a: "Yes — we can incorporate your existing logos and branding into 3D printed creations like keychains, signage, and displays. We also provide in-house graphic design for logos and custom merchandise." },
      { q: "How detailed can the prints be?", a: "Extremely detailed. We can print fine features, sharp edges, and smooth curves with precision. If you have tiny text or intricate geometry, we can usually dial in settings to make it come out clean." },
      { q: "Can you design mechanical or functional parts?", a: "Yes — we frequently design brackets, mounts, enclosures, fixtures, spacers, adapters, and other practical components with strength, tolerances, and real-world use in mind." },
    ],
  },
  {
    section: "Products & Capabilities",
    items: [
      { q: "What kinds of items can you make?", a: "Keychains, signage, business promos, awards, prototypes, toys, custom gifts, cosplay items, tags, displays, organizers, and much more. If it can be 3D printed, we're probably interested in making it." },
      { q: "Do you offer multi-color printing?", a: "Yes — our printers support advanced multi-color printing, letting us create vibrant items with color changes, gradients, and multi-colored logos or text in a single print." },
      { q: "What are your size limits?", a: "Standard prints can be up to around 256 mm (about 10 inches) in each dimension. Larger items can be split into sections and assembled seamlessly after printing." },
      { q: "What material options do you offer?", a: "We commonly print in PLA, PETG, flexible TPU, silk finishes, glow-in-the-dark, matte, and other specialty filaments. We'll help choose the right filament for your look and use case." },
      { q: "Can you print large quantities?", a: "Yes — we operate a print farm capable of handling both small and large runs efficiently. Whether you need a single prototype or hundreds of the same item, we can scale up." },
    ],
  },
  {
    section: "Ordering, Quotes & Payments",
    items: [
      { q: "How do I request a quote?", a: "Send us your idea, image, file, or description by email or through our custom order form. We'll review the details and send back an estimate covering design (if needed), material, and printing costs." },
      { q: "How long does an order take?", a: "Most orders take about 2–7 days, depending on complexity and quantity. Larger or design-heavy projects may take longer. If you have a deadline, let us know and we'll tell you what's realistic." },
      { q: "How do you determine pricing?", a: "Pricing is based on material used, print time, size, number of colors, and any custom design or modeling work required. We're happy to walk you through the quote so you know what goes into it." },
      { q: "Do you accept rush orders?", a: "Yes — depending on printer availability and project size. Reach out with your deadline and we'll let you know if a rush is possible and whether any rush fees apply." },
      { q: "What payment methods do you take?", a: "We accept all major credit and debit cards online. For larger or repeat orders we can work with business invoicing. Bulk orders may require a deposit before production begins." },
      { q: "Can I approve my design before printing?", a: "Yes — for custom designs, we always send a preview (screenshots, renders, or photos of a test print) for approval before running the final batch. We want you to be happy with the result." },
    ],
  },
  {
    section: "Shipping & Pickup",
    items: [
      { q: "Do you offer local pickup?", a: "Yes — local pickup in the OKC / Mustang / Yukon area is always free and available. We'll coordinate a time that works for you." },
      { q: "Do you ship orders?", a: "Yes — we ship anywhere in the US. Flat-rate shipping is $8.99. Orders over $35 ship free." },
      { q: "How long does shipping take?", a: "Most shipped orders arrive within 3–7 business days after production is complete. We'll send a tracking number when your order ships." },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest text-[#a78bfa] mb-3">Questions & Answers</p>
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-[#a0a0b8] max-w-2xl">
          New to 3D printing? Not sure what&apos;s possible, how pricing works, or whether your idea
          can be turned into a real product? This page covers the most common questions our
          customers ask — from basic 3D printing info to custom design, shipping, and bulk orders.
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.section}>
            <h2 className="text-lg font-semibold text-[#c4b5fd] mb-4 pb-2 border-b border-white/10">
              {section.section}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <details
                  key={item.q}
                  className="group border border-white/10 rounded-xl bg-white/5 overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-sm font-medium hover:bg-white/5 transition-colors">
                    {item.q}
                    <span className="text-[#a78bfa] shrink-0 transition-transform group-open:rotate-180">▾</span>
                  </summary>
                  <div className="px-5 pb-4 pt-1 text-sm text-[#a0a0b8] leading-relaxed border-t border-white/5">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-[#a78bfa]/30 bg-[#a78bfa]/5 p-8">
        <h2 className="text-xl font-semibold mb-2">Don&apos;t see your question?</h2>
        <p className="text-[#a0a0b8] text-sm mb-4">
          Reach out and ask anything — even if you&apos;re not sure how to explain it yet.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:morgan3dokc@gmail.com"
            className="px-5 py-2.5 rounded-full bg-[#a78bfa] text-black text-sm font-semibold hover:bg-[#c4b5fd] transition-colors"
          >
            Email us
          </a>
          <Link
            href="/services/custom-order"
            className="px-5 py-2.5 rounded-full border border-[#a78bfa] text-[#a78bfa] text-sm font-semibold hover:bg-[#a78bfa]/10 transition-colors"
          >
            Submit a custom order
          </Link>
        </div>
      </div>
    </main>
  );
}
