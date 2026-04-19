import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export async function SiteHeader() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 bg-[--color-background]/80 backdrop-blur-md border-b border-[--color-border]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[--color-neon-purple] glow-text-purple hover:opacity-90 transition-opacity">
          M3DP
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-[--color-muted]">
          <Link href="/shop" className="hover:text-[--color-foreground] transition-colors">Shop</Link>
          <Link href="/services/custom-order" className="hover:text-[--color-foreground] transition-colors">Custom Orders</Link>
          <Link href="/services/print-by-the-hour" className="hover:text-[--color-foreground] transition-colors">Print by the Hour</Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Cart icon — wired in Phase 3 */}
          <div className="w-8 h-8 flex items-center justify-center text-[--color-muted] hover:text-[--color-foreground] cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>

          {userId ? (
            <UserButton />
          ) : (
            <Link href="/sign-in" className="text-sm text-[--color-muted] hover:text-[--color-foreground] transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
