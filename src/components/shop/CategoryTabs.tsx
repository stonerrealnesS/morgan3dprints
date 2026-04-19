"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Category = {
  name: string;
  slug: string;
};

type CategoryTabsProps = {
  categories: Category[];
};

export function CategoryTabs({ categories }: CategoryTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  function handleTabClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (slug === "") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    // Reset pagination on category change
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  }

  const tabs = [{ name: "All", slug: "" }, ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
      {tabs.map((tab) => {
        const isActive = tab.slug === activeCategory;

        return (
          <button
            key={tab.slug || "all"}
            onClick={() => handleTabClick(tab.slug)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
            style={
              isActive
                ? {
                    background: "rgba(168,85,247,0.2)",
                    border: "1px solid rgba(168,85,247,0.6)",
                    color: "#a855f7",
                    boxShadow:
                      "0 0 12px rgba(168,85,247,0.3), inset 0 0 8px rgba(168,85,247,0.1)",
                    textShadow: "0 0 8px rgba(168,85,247,0.6)",
                  }
                : {
                    background: "#0d0d14",
                    border: "1px solid #1e1e30",
                    color: "#8888aa",
                  }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)";
                e.currentTarget.style.color = "#f0f0ff";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "#1e1e30";
                e.currentTarget.style.color = "#8888aa";
              }
            }}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
