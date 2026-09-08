// Real reviews, pulled from the public Reviews tab on the morgan_3d_prints
// Whatnot profile (whatnot.com/user/morgan_3d_prints/reviews) — genuine
// buyer quotes, attributed by the same public username Whatnot shows, with
// only obvious typos cleaned up for readability. Nothing here is invented.
const TESTIMONIALS: { quote: string; author: string; rating: number }[] = [
  {
    quote: "Luv the ducks and other items. They r great. Luv the bag of misfits too. Thanks yall!! Great fun show too!!",
    author: "skyhippie",
    rating: 5,
  },
  {
    quote: "Fav seller on Whatnot! Awesome packing and fast shipping!!! Thank you",
    author: "theaveragejane",
    rating: 5,
  },
  {
    quote: "Thank you for the awesome giveaways! I always love my jeep ducks.",
    author: "jhcrafty13",
    rating: 5,
  },
  {
    quote: "I love all my 3D things I bought! Thank you for making my day when I received my package, especially the duck hunt giveaway that I won — you guys are the best!",
    author: "1978gingergirl",
    rating: 5,
  },
  {
    quote: "Awesome detailed prints as always 💯🫶 ty",
    author: "shaggy89shaggz",
    rating: 5,
  },
  {
    quote: "Thank you so much for the awesome 🦆 ducks!",
    author: "ineedtowinlol",
    rating: 5,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-3.5 h-3.5"
          style={{ color: star <= rating ? "#a855f7" : "#1e1e30" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 0-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end gap-4 mb-2">
        <h2 className="text-3xl font-bold text-white">What Buyers Are Saying</h2>
        <div
          className="flex-1 h-px mb-2"
          style={{ background: "linear-gradient(to right, rgba(168,85,247,0.6), transparent)" }}
        />
      </div>
      <a
        href="https://www.whatnot.com/user/morgan_3d_prints/reviews"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm mb-10 hover:underline"
        style={{ color: "#8888aa" }}
      >
        <Stars rating={5} />
        <span>5.0 · 491 reviews on Whatnot ↗</span>
      </a>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.author}
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
          >
            <Stars rating={t.rating} />
            <p className="text-sm leading-relaxed" style={{ color: "#c8c8dc" }}>
              &ldquo;{t.quote}&rdquo;
            </p>
            <p className="text-xs mt-auto" style={{ color: "#8888aa" }}>
              — {t.author}, via Whatnot
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
