import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();
  const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "").split(",").map((s) => s.trim());

  if (!userId || !adminIds.includes(userId)) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-[--color-background]">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-[--color-surface] border-r border-[--color-border] p-6">
          <p className="text-[--color-neon-purple] font-bold text-lg mb-8 glow-text-purple">M3DP Admin</p>
          <nav className="space-y-2 text-sm text-[--color-muted]">
            <a href="/admin" className="block hover:text-[--color-foreground]">Dashboard</a>
            <a href="/admin/products" className="block hover:text-[--color-foreground]">Products</a>
            <a href="/admin/orders" className="block hover:text-[--color-foreground]">Orders</a>
            <a href="/admin/categories" className="block hover:text-[--color-foreground]">Categories</a>
            <a href="/admin/discounts" className="block hover:text-[--color-foreground]">Discounts</a>
            <a href="/admin/custom-requests" className="block hover:text-[--color-foreground]">Custom Requests</a>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
