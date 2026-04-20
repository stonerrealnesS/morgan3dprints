"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  links: { href: string; label: string }[];
  userId: string | null;
}

export function MobileNav({ links, userId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-[#8888aa] hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-[#050508]/95 backdrop-blur-md" onClick={() => setOpen(false)}>
          <nav className="flex flex-col px-6 py-6 gap-1" onClick={(e) => e.stopPropagation()}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-lg text-[#a0a0b8] hover:text-white border-b border-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!userId && (
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="mt-4 py-3 text-lg text-[#a78bfa] hover:text-white transition-colors"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
