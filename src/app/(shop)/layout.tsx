import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EmailCapturePopup } from "@/components/shop/EmailCapturePopup";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <EmailCapturePopup />
    </>
  );
}
