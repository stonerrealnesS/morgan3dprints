"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold text-[#ec4899] mb-4">Something went wrong</h2>
      <p className="text-[#8888aa] mb-8">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-lg bg-[--color-neon-purple] text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
