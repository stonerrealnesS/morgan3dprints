"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with URL when navigating
  useEffect(() => {
    setValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  function updateSearch(newValue: string) {
    setValue(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (newValue.trim()) {
        params.set("search", newValue.trim());
      } else {
        params.delete("search");
      }
      // Reset to page 1 on new search
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  }

  function clearSearch() {
    setValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Magnifying glass icon */}
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "#8888aa" }}
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
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => updateSearch(e.target.value)}
        placeholder="Search products…"
        className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
        style={{
          background: "#0d0d14",
          border: "1px solid #1e1e30",
          color: "#f0f0ff",
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = "1px solid rgba(168,85,247,0.6)";
          e.currentTarget.style.boxShadow =
            "0 0 0 3px rgba(168,85,247,0.15), 0 0 12px rgba(168,85,247,0.2)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = "1px solid #1e1e30";
          e.currentTarget.style.boxShadow = "none";
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "#8888aa" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0ff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8888aa")}
          aria-label="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
