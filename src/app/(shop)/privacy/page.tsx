import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Morgan 3D Prints collects when you use morgan3dokc.com, who sees it, and how to ask us to change or delete it.",
};

const sections = [
  {
    heading: "What we collect",
    body: "When you place an order: your name, email, shipping address and what you ordered. If you choose pickup, we may not need an address. When you make an account: your email and the sign-in details you choose, handled by Clerk. When you send a custom order request or a message: what you write and your email so we can reply. If you join our email list: your email address. Visit data: which pages people view, what kind of device they use and roughly where they are, through Google Analytics and Vercel Analytics. Google Analytics uses cookies. You can block them in your browser settings and the shop still works. We do not use advertising pixels from Facebook, Instagram or TikTok.",
  },
  {
    heading: "Payments",
    body: "Payments are handled by Stripe. Your card number goes straight to Stripe, never reaches our site or our files, and falls under Stripe's own privacy policy.",
  },
  {
    heading: "How we use it",
    body: "To make and ship your order, send order and shipping emails, answer your messages and, if you joined the list, tell you about new items. Emails are sent through Resend. Photos on the site are stored with Cloudinary. The order database is stored with Neon.",
  },
  {
    heading: "Who else sees it",
    body: "Only the services above see it, plus the carrier that delivers your package, which gets your name and address. Nobody gets it through a sale or rental of customer information, because we never do that.",
  },
  {
    heading: "Email list",
    body: "To be taken off our email list, email morgan3dokc@gmail.com and we will remove you.",
  },
  {
    heading: "Your choices",
    body: "Email morgan3dokc@gmail.com to see, correct or delete your information. We reply within a few business days. We keep some order records for tax and bookkeeping.",
  },
  {
    heading: "Children",
    body: "The site is meant for adults, and for kids buying with a parent. We do not knowingly collect information from children under 13.",
  },
  {
    heading: "Changes",
    body: "If we change this page, the date at the top changes.",
  },
  {
    heading: "Contact",
    body: "You can reach West Print Company LLC, doing business as Morgan 3D Prints, in Oklahoma at morgan3dokc@gmail.com.",
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      intro="West Print Company LLC, doing business as Morgan 3D Prints, sells 3D-printed products at morgan3dokc.com. This page says what we collect when you use the site and what we do with it."
      sections={sections}
      updated="October 2026"
    />
  );
}
