import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1e1e30] bg-[#0a0a12] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-bold text-[#a855f7] mb-2">M3DP</p>
            <p className="text-sm text-[#8888aa] mb-4 max-w-xs">
              Custom 3D-printed products handcrafted in OKC, Oklahoma. Local pickup free. Ships nationwide.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="mailto:morgan3dokc@gmail.com"
                className="text-xs border border-white/10 rounded-full px-3 py-1.5 text-[#8888aa] hover:text-white hover:border-white/30 transition-colors"
              >
                morgan3dokc@gmail.com
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Shop</p>
            <ul className="space-y-2 text-sm text-[#8888aa]">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/services/custom-order" className="hover:text-white transition-colors">Custom Orders</Link></li>
              <li><Link href="/services/print-by-the-hour" className="hover:text-white transition-colors">Print by the Hour</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Services</p>
            <ul className="space-y-2 text-sm text-[#8888aa]">
              <li><Link href="/services" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/services/custom-order" className="hover:text-white transition-colors">Custom Merch</Link></li>
              <li><Link href="/services/custom-order" className="hover:text-white transition-colors">Prototypes & Fixtures</Link></li>
              <li><Link href="/services/custom-order" className="hover:text-white transition-colors">Signage & Displays</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Info</p>
            <ul className="space-y-2 text-sm text-[#8888aa]">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[#1e1e30] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8888aa]">
          <p>© {new Date().getFullYear()} Morgan 3D Prints — OKC, Oklahoma. All rights reserved.</p>
          <div className="flex gap-3">
            <span className="px-2.5 py-1 rounded-full border border-white/10">Local OKC Studio</span>
            <span className="px-2.5 py-1 rounded-full border border-white/10">Ships Nationwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
