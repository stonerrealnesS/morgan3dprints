import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/packing", label: "Packing" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/whatnot-sync", label: "🦆 Sync with Whatnot" },
  { href: "/admin/whatnot-finds-sort", label: "🧹 Sort Whatnot Finds" },
  { href: "/admin/clean-names", label: "🧽 Clean Product Names" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/marketing", label: "📣 Marketing" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/custom-requests", label: "Custom Requests" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!userId) {
    redirect("/sign-in");
  }

  // An empty list means nobody is admin; they still see their ID below to request access.
  if (!adminIds.includes(userId)) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-[#f0f0ff] text-xl font-bold mb-2">Not authorized</p>
          <p className="text-[#8888aa] text-sm mb-6">
            You&apos;re signed in, but this account isn&apos;t on the admin allowlist yet. Send this ID to whoever manages the site so they can add you:
          </p>
          <p className="font-mono text-sm bg-[#0d0d14] border border-[#1e1e30] rounded-lg px-4 py-3 break-all text-[#a855f7]">
            {userId}
          </p>
          <Link href="/" className="inline-block mt-6 text-[#8888aa] hover:text-[#f0f0ff] text-sm">
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Phone and tablet: menu as a scrollable row across the top */}
      <header className="md:hidden bg-[#0d0d14] border-b border-[#1e1e30] px-4 py-3">
        <p className="text-[#a855f7] font-bold glow-text-purple mb-2">M3DP Admin</p>
        <nav className="flex gap-1 overflow-x-auto text-sm -mx-1">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap px-3 py-2 rounded-lg text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a2e]"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <div className="flex">
        <aside className="hidden md:flex w-64 min-h-screen bg-[#0d0d14] border-r border-[#1e1e30] p-6 flex-col">
          <div className="mb-8">
            <p className="text-[#a855f7] font-bold text-lg glow-text-purple">M3DP Admin</p>
            <p className="text-[#8888aa] text-xs mt-1">Morgan 3D Prints</p>
          </div>
          <nav className="space-y-1 text-sm flex-1">
            {navLinks.map(({ href, label }) => (
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
            <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#8888aa] hover:text-[#f0f0ff] text-sm transition-colors">
              ← Back to site
            </Link>
          </div>
        </aside>
        <main className="flex-1 min-w-0 p-4 md:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
