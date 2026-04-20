"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/lib/actions/reviews";

type Props = {
  productId: string;
  existingReview?: { rating: number; body: string | null } | null;
};

export function ReviewForm({ productId, existingReview }: Props) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating) return;
    const formData = new FormData(e.currentTarget);
    formData.set("rating", String(rating));
    formData.set("productId", productId);
    startTransition(async () => {
      await submitReview(formData);
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-xl p-5 text-center" style={{ background: "#0d0d14", border: "1px solid rgba(74,222,128,0.3)" }}>
        <p className="font-semibold" style={{ color: "#4ade80" }}>Thank you for your review!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-5 space-y-4" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
      <p className="font-semibold text-[#f0f0ff]">{existingReview ? "Edit your review" : "Leave a review"}</p>

      {/* Star picker */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={star <= (hovered || rating) ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-7 h-7"
              style={{ color: star <= (hovered || rating) ? "#a855f7" : "#1e1e30" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 0-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </button>
        ))}
      </div>

      <div>
        <textarea
          name="body"
          rows={3}
          defaultValue={existingReview?.body ?? ""}
          placeholder="Share your experience… (optional)"
          className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] resize-none outline-none focus:ring-1 focus:ring-[#a855f7]"
          style={{ background: "#13131e", border: "1px solid #1e1e30" }}
        />
      </div>

      <button
        type="submit"
        disabled={!rating || isPending}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
      >
        {isPending ? "Submitting…" : existingReview ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}
