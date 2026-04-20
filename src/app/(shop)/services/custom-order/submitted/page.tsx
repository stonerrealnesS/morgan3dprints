import Link from "next/link";

export default function CustomOrderSubmittedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(34,211,238,0.10)", border: "2px solid rgba(34,211,238,0.4)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10" style={{ color: "#22d3ee" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold text-[#f0f0ff] mb-3">Request Submitted!</h1>
      <p className="text-[#8888aa] max-w-md mb-8">
        We&apos;ve received your custom order request and will email you a quote within 24 hours.
        Thanks for choosing Morgan 3D Prints!
      </p>
      <div className="flex gap-3">
        <Link
          href="/shop"
          className="px-6 py-3 rounded-xl font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
        >
          Browse the Shop
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl font-semibold text-[#8888aa]"
          style={{ border: "1px solid #1e1e30" }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
