import type { Metadata } from "next";
import { StoreShell } from "@/components/public/store-shell";
import { getShopConfig } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Vision Thru Optics Velachery."
};

const sections = [
  {
    title: "What we collect",
    items: [
      "Name, phone number, delivery address — collected when you place an order",
      "Email address — only if you contact us via the contact form",
      "We do NOT collect payment details (UPI payments are handled directly by your payment app)"
    ]
  },
  {
    title: "Why we collect it",
    items: [
      "To process and deliver your order",
      "To contact you about your order status",
      "To respond to your enquiries"
    ]
  },
  {
    title: "Who we share it with",
    items: [
      "Nobody. We do not sell, rent, or share your personal data with any third party."
    ]
  },
  {
    title: "How long we keep it",
    items: [
      "Order data is kept for 2 years for warranty and return purposes.",
      "Contact messages are kept for 6 months."
    ]
  },
  {
    title: "Your rights (under India's DPDP Act 2023)",
    items: [
      "You can request to view, correct, or delete your data at any time.",
      "Contact us at visionthruoptics@gmail.com or +91 7305319309"
    ]
  },
  {
    title: "Cookies",
    items: [
      "This website does not use tracking cookies or advertising cookies.",
      "Only essential session cookies are used for the admin login."
    ]
  }
];

export default function PrivacyPage() {
  const shop = getShopConfig();

  return (
    <StoreShell>
      <main className="bg-white py-14">
        <div className="container-page max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
            Privacy
          </p>
          <h1 className="mt-2 font-display text-5xl font-bold leading-tight">
            Privacy Policy — Vision Thru Optics Velachery
          </h1>
          <p className="mt-4 text-lg font-semibold text-optical-muted">
            Last updated: June 2026
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section, index) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl font-bold">
                  {index + 1}. {section.title}
                </h2>
                <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-optical-muted">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}

            <section>
              <h2 className="font-display text-2xl font-bold">7. Contact</h2>
              <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-optical-muted">
                <li>{shop.address}</li>
                <li>{shop.email}</li>
                <li>{shop.phone}</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </StoreShell>
  );
}
