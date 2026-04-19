export function SiteFooter() {
  return (
    <footer className="border-t border-[#1e1e30] bg-[#0d0d14] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-lg font-bold text-[#a855f7] glow-text-purple mb-2">Morgan 3D Prints</p>
            <p className="text-sm text-[#8888aa] max-w-xs">
              Custom 3D-printed products handcrafted in OKC, Oklahoma. Shipped nationwide.
            </p>
          </div>

          <div className="flex gap-12 text-sm text-[#8888aa]">
            <div className="space-y-2">
              <p className="font-semibold text-[#f0f0ff]">Shop</p>
              <a href="/shop" className="block hover:text-[#f0f0ff]">All Products</a>
              <a href="/services/custom-order" className="block hover:text-[#f0f0ff]">Custom Orders</a>
              <a href="/services/print-by-the-hour" className="block hover:text-[#f0f0ff]">Print by the Hour</a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[#f0f0ff]">Info</p>
              <a href="/faq" className="block hover:text-[#f0f0ff]">FAQ</a>
              <a href="/about" className="block hover:text-[#f0f0ff]">About</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#1e1e30] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8888aa]">
          <p>© {new Date().getFullYear()} Morgan 3D Prints. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="px-2 py-1 rounded border border-[#1e1e30]">🇺🇸 Made in USA</span>
            <span className="px-2 py-1 rounded border border-[#1e1e30]">🚚 Ships Nationwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
