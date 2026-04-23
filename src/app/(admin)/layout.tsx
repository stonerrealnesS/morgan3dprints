import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!userId || (adminIds.length > 0 && !adminIds.includes(userId))) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-[#0d0d14] border-r border-[#1e1e30] p-6 flex flex-col">
          <div className="mb-8">
            <p className="text-[#a855f7] font-bold text-lg glow-text-purple">M3DP Admin</p>
            <p className="text-[#8888aa] text-xs mt-1">Morgan 3D Prints</p>
          </div>
          <nav className="space-y-1 text-sm flex-1">
            {[
              { href: "/admin", label: "Dashboard" },
              { href: "/admin/products", label: "Products" },
              { href: "/admin/orders", label: "Orders" },
              { href: "/admin/categories", label: "Categories" },
              { href: "/admin/discounts", label: "Discounts" },
              { href: "/admin/customers", label: "Customers" },
              { href: "/admin/custom-requests", label: "Custom Requests" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="flex items-center px-3 py-2 rounded-lg text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a2e] transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-[#1e1e30]">
            <a href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#8888aa] hover:text-[#f0f0ff] text-sm transition-colors">
              ← Back to site
            </a>
          </div>
        </aside>
        <main className="flex-1 p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
