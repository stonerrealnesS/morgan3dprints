"use client";

import Link from "next/link";

type CategoryItem = {
  name: string;
  slug: string;
  icon: string;
  color: string;
  glow: string;
};

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/shop/${cat.slug}`}
          className="flex flex-col items-center gap-3 p-6 rounded-xl text-center group transition-all duration-200"
          style={{ background: "#13131e", border: "1px solid #1e1e30" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = cat.color + "80";
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${cat.glow}`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#1e1e30";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <span className="text-3xl" style={{ filter: `drop-shadow(0 0 8px ${cat.glow})` }}>
            {cat.icon}
          </span>
          <span className="text-sm font-semibold text-white leading-tight">{cat.name}</span>
          <span className="text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: cat.color }}>
            Shop →
          </span>
        </Link>
      ))}
    </div>
  );
}
