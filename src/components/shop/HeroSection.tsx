"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section
      className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden"
      style={{ background: "#050508" }}
    >
      {/* Background grid glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(168,85,247,0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6 max-w-4xl"
      >
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full"
          style={{
            background: "rgba(168,85,247,0.1)",
            border: "1px solid rgba(168,85,247,0.3)",
            color: "#a855f7",
          }}
        >
          Handcrafted in OKC
        </motion.span>

        {/* Animated gradient heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none"
          style={{
            background:
              "linear-gradient(135deg, #a855f7 0%, #22d3ee 50%, #ec4899 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "gradientShift 6s ease infinite",
          }}
        >
          Morgan 3D Prints
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="text-lg sm:text-xl max-w-xl leading-relaxed"
          style={{ color: "#8888aa" }}
        >
          Custom 3D-printed products handcrafted in OKC.{" "}
          <span style={{ color: "#f0f0ff" }}>Bold. Neon. Yours.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <Link
            href="/shop"
            className="px-8 py-3.5 rounded-lg font-bold text-base transition-all duration-200 min-w-[160px] text-center"
            style={{
              background: "#a855f7",
              color: "#fff",
              boxShadow: "0 0 20px rgba(168,85,247,0.5)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#c084fc";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 32px rgba(168,85,247,0.7)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#a855f7";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 20px rgba(168,85,247,0.5)";
            }}
          >
            Shop Now
          </Link>

          <Link
            href="/services/custom-order"
            className="px-8 py-3.5 rounded-lg font-bold text-base transition-all duration-200 min-w-[160px] text-center"
            style={{
              background: "transparent",
              border: "2px solid #22d3ee",
              color: "#22d3ee",
              boxShadow: "0 0 12px rgba(34,211,238,0.2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(34,211,238,0.1)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 24px rgba(34,211,238,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 12px rgba(34,211,238,0.2)";
            }}
          >
            Custom Order
          </Link>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex flex-col items-center gap-2"
          style={{ color: "#8888aa" }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
}
