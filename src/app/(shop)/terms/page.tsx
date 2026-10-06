import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules for buying from morgan3dokc.com: products, prices, orders, shipping, returns and custom orders.",
};

const sections = [
  {
    heading: "Products",
    body: "Our items are 3D printed, so you may see thin layer lines up close, and colors can vary a little from spool to spool. Photos and sizes are as close as we can make them. If a listing states a size, material or color, that is what you should get.",
  },
  {
    heading: "Prices and payment",
    body: "Prices are in US dollars. The cart shows the item total and shipping before you pay. Payment is taken by Stripe when you place the order.",
  },
  {
    heading: "Orders",
    body: "An order is accepted when you get our confirmation email. If an item is out of stock or we cannot make it, we will tell you and refund you in full.",
  },
  {
    heading: "Shipping and pickup",
    body: "See the Shipping page for costs, timing and local pickup.",
  },
  {
    heading: "Returns",
    body: "See the Returns & Refunds page.",
  },
  {
    heading: "Custom orders",
    body: "A custom order starts with a quote. Work begins after you accept the quote and pay. Custom items are made for you, so they are final sale unless they arrive damaged or wrong.",
  },
  {
    heading: "Our photos and designs",
    body: "Do not copy or resell our photos or designs without asking first.",
  },
  {
    heading: "Accounts",
    body: "Keep your sign-in private. You are responsible for what happens on your account.",
  },
  {
    heading: "Contact",
    body: "Email morgan3dokc@gmail.com.",
  },
];

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      intro="By placing an order at morgan3dokc.com you agree to these rules. The shop is run by West Print Company LLC, doing business as Morgan 3D Prints, based in Oklahoma."
      sections={sections}
      updated="October 2026"
    />
  );
}
