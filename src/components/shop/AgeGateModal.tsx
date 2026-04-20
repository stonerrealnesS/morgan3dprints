"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const AGE_GATE_KEY = "age_verified";

export function useAgeGate() {
  const [isVerified, setIsVerified] = useState(true); // default true to avoid flash

  useEffect(() => {
    const stored = sessionStorage.getItem(AGE_GATE_KEY);
    setIsVerified(stored === "true");
  }, []);

  function verify() {
    sessionStorage.setItem(AGE_GATE_KEY, "true");
    setIsVerified(true);
  }

  return { isVerified, verify };
}

type AgeGateModalProps = {
  onVerified: () => void;
};

export function AgeGateModal({ onVerified }: AgeGateModalProps) {
  const router = useRouter();

  function handleVerify() {
    sessionStorage.setItem(AGE_GATE_KEY, "true");
    onVerified();
  }

  function handleLeave() {
    router.push("/shop");
  }

  return (
    <AnimatePresence>
      <motion.div
        key="age-gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(5,5,8,0.95)", backdropFilter: "blur(12px)" }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 260 }}
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(168,85,247,0.10)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
              style={{ color: "#a855f7" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-[#f0f0ff] mb-2">
            Age Verification
          </h2>
          <p className="text-[#8888aa] text-sm mb-6 leading-relaxed">
            This section contains products intended for adults only. You must be
            18 years or older to view this content.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleVerify}
              className="w-full py-3 rounded-xl font-bold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                boxShadow: "0 0 20px rgba(168,85,247,0.4)",
              }}
            >
              I am 18+
            </button>
            <button
              onClick={handleLeave}
              className="w-full py-3 rounded-xl font-semibold text-[#8888aa] hover:text-[#f0f0ff] transition-colors"
              style={{ background: "#13131e", border: "1px solid #1e1e30" }}
            >
              Leave
            </button>
          </div>

          <p className="text-xs text-[#8888aa] mt-5">
            By clicking &quot;I am 18+&quot; you confirm that you are of legal
            age in your jurisdiction.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
