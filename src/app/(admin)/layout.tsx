import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();
  const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "").split(",").map((s) => s.trim());

  if (!userId || !adminIds.includes(userId)) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-[#050508]">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-[#0d0d14] border-r border-[#1e1e30] p-6">
          <p className="text-[#a855f7] font-bold text-lg mb-8 glow-text-purple">M3DP Admin</p>
          <nav className="space-y-2 text-sm text-[#8888aa]">
            <a href="/admin" className="block hover:text-[#f0f0ff]">Dashboard</a>
            <a href="/admin/products" className="block hover:text-[#f0f0ff]">Products</a>
            <a href="/admin/orders" className="block hover:text-[#f0f0ff]">Orders</a>
            <a href="/admin/categories" className="block hover:text-[#f0f0ff]">Categories</a>
            <a href="/admin/discounts" className="block hover:text-[#f0f0ff]">Discounts</a>
            <a href="/admin/custom-requests" className="block hover:text-[#f0f0ff]">Custom Requests</a>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
