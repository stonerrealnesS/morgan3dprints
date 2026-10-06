type Section = { heading: string; body: string };

export function PolicyPage({
  title,
  intro,
  sections,
  updated,
}: {
  title: string;
  intro: string;
  sections: Section[];
  updated?: string;
}) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest text-[#a78bfa] mb-3">Policy</p>
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-[#a0a0b8] max-w-2xl">{intro}</p>
        {updated ? <p className="text-xs text-[#8888aa] mt-3">Last updated {updated}</p> : null}
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
        <h2 className="text-xl font-semibold mb-2">Questions?</h2>
        <p className="text-[#a0a0b8] text-sm mb-4">
          Email us and we&apos;ll answer, usually within 1 business day.
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
