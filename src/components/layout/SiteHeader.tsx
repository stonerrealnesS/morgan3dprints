import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CartButton } from "@/components/cart/CartButton";

export async function SiteHeader() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 bg-[#050508]/80 backdrop-blur-md border-b border-[#1e1e30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-[#a855f7] glow-text-purple hover:opacity-90 transition-opacity"
        >
          M3DP
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-[#8888aa]">
          <Link href="/shop" className="hover:text-[#f0f0ff] transition-colors">
            Shop
          </Link>
          <Link
            href="/services/custom-order"
            className="hover:text-[#f0f0ff] transition-colors"
          >
            Custom Orders
          </Link>
          <Link
            href="/services/print-by-the-hour"
            className="hover:text-[#f0f0ff] transition-colors"
          >
            Print by the Hour
          </Link>
          <Link href="/about" className="hover:text-[#f0f0ff] transition-colors">
            About
          </Link>
          <Link href="/faq" className="hover:text-[#f0f0ff] transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <CartButton />

          {userId ? (
            <UserButton />
          ) : (
            <Link
              href="/sign-in"
              className="text-sm text-[#8888aa] hover:text-[#f0f0ff] transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
