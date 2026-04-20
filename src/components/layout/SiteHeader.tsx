import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CartButton } from "@/components/cart/CartButton";
import { MobileNav } from "@/components/layout/MobileNav";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/services/custom-order", label: "Custom Orders" },
  { href: "/services/print-by-the-hour", label: "Print by the Hour" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 bg-[#050508]/80 backdrop-blur-md border-b border-[#1e1e30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-[#a855f7] hover:opacity-90 transition-opacity"
        >
          M3DP
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#8888aa]">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#f0f0ff] transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CartButton />
          {userId ? (
            <UserButton />
          ) : (
            <Link href="/sign-in" className="hidden md:block text-sm text-[#8888aa] hover:text-[#f0f0ff] transition-colors">
              Sign in
            </Link>
          )}
          <MobileNav links={navLinks} userId={userId} />
        </div>
      </div>
    </header>
  );
}
