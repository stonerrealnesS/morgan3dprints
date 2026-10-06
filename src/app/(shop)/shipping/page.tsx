import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Morgan 3D Prints shipping: US only, $8.99 flat or free over $35, USPS with tracking, and free local pickup in the Oklahoma City area.",
};

const sections = [
  {
    heading: "Where we ship",
    body: "We ship within the United States only. We do not ship outside the US.",
  },
  {
    heading: "Cost",
    body: "Shipping is $8.99 flat. Orders of $35 or more ship free. The total, with shipping, shows on the cart page before you pay.",
  },
  {
    heading: "How long it takes",
    body: "Most of what we sell is printed after you order, so there are two clocks. We print and pack within 2 to 5 business days. Then USPS takes about 3 to 7 business days to deliver, so plan on roughly 5 to 12 business days from order to your door. Every order ships USPS with tracking, and you get an email with the tracking number when it goes out.",
  },
  {
    heading: "Local pickup",
    body: "If you are in the Oklahoma City area, pickup is free. Choose Local Pickup at checkout and we will message you to set a time once your order is ready. Pickup is by appointment.",
  },
  {
    heading: "Packaging",
    body: "If you tick discreet packaging at checkout, we pack your order with that request noted.",
  },
  {
    heading: "Where is my order?",
    body: "Email morgan3dokc@gmail.com with your order number. We read every message and usually answer within 1 business day.",
  },
  {
    heading: "Damaged or wrong item",
    body: "See our Returns & Refunds page. We replace the item or refund it, including the shipping you paid.",
  },
];

export default function ShippingPage() {
  return (
    <PolicyPage
      title="Shipping"
      intro="What shipping costs, how long it takes, and how local pickup works at Morgan 3D Prints."
      sections={sections}
      updated="October 2026"
    />
  );
}
