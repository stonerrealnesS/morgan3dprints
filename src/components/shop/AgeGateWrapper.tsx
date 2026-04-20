"use client";

import { useEffect, useState } from "react";
import { AgeGateModal } from "./AgeGateModal";

type AgeGateWrapperProps = {
  requiresAgeGate: boolean;
  children: React.ReactNode;
};

export function AgeGateWrapper({ requiresAgeGate, children }: AgeGateWrapperProps) {
  const [isVerified, setIsVerified] = useState(true); // optimistic to avoid flash
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!requiresAgeGate) {
      setIsVerified(true);
      setChecked(true);
      return;
    }
    const stored = sessionStorage.getItem("age_verified");
    setIsVerified(stored === "true");
    setChecked(true);
  }, [requiresAgeGate]);

  // Don't show modal until we've read sessionStorage (avoids SSR mismatch)
  if (!checked) return <>{children}</>;

  return (
    <>
      {!isVerified && requiresAgeGate && (
        <AgeGateModal onVerified={() => setIsVerified(true)} />
      )}
      {children}
    </>
  );
}
