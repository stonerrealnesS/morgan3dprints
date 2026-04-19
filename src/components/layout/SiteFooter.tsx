export function SiteFooter() {
  return (
    <footer className="border-t border-[--color-border] bg-[--color-surface] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-lg font-bold text-[--color-neon-purple] glow-text-purple mb-2">Morgan 3D Prints</p>
            <p className="text-sm text-[--color-muted] max-w-xs">
              Custom 3D-printed products handcrafted in OKC, Oklahoma. Shipped nationwide.
            </p>
          </div>

          <div className="flex gap-12 text-sm text-[--color-muted]">
            <div className="space-y-2">
              <p className="font-semibold text-[--color-foreground]">Shop</p>
              <a href="/shop" className="block hover:text-[--color-foreground]">All Products</a>
              <a href="/services/custom-order" className="block hover:text-[--color-foreground]">Custom Orders</a>
              <a href="/services/print-by-the-hour" className="block hover:text-[--color-foreground]">Print by the Hour</a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[--color-foreground]">Info</p>
              <a href="/faq" className="block hover:text-[--color-foreground]">FAQ</a>
              <a href="/about" className="block hover:text-[--color-foreground]">About</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[--color-border] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[--color-muted]">
          <p>© {new Date().getFullYear()} Morgan 3D Prints. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="px-2 py-1 rounded border border-[--color-border]">🇺🇸 Made in USA</span>
            <span className="px-2 py-1 rounded border border-[--color-border]">🚚 Ships Nationwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
