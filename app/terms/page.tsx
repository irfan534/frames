import type { Metadata } from "next";
import { StoreShell } from "@/components/public/store-shell";
import { getShopConfig } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for Vision Thru Optics Velachery."
};

const sections = [
  {
    title: "About us",
    body:
      "Vision Thru Optics is a family-run optical shop based in Velachery, Chennai. Our website allows customers to browse and order frames, sunglasses, and contact lenses online."
  },
  {
    title: "Orders",
    items: [
      "All orders are subject to availability and confirmation.",
      "Prices are in Indian Rupees (₹) and include applicable taxes.",
      "We reserve the right to cancel any order if the item is out of stock.",
      "Orders are confirmed only after manual payment verification by our team."
    ]
  },
  {
    title: "Payments",
    items: [
      "We accept UPI payments via GPay, PhonePe, and any UPI-compatible app.",
      "Payment is made by scanning the QR code shown after checkout.",
      "Orders are processed only after payment is verified by our team.",
      "We do not store any payment information."
    ]
  },
  {
    title: "Delivery",
    items: [
      "We offer home delivery within Chennai.",
      "Delivery typically takes 2–4 business days after order confirmation.",
      "Free delivery on all orders above ₹999.",
      "Store pickup is also available at our Velachery location."
    ]
  },
  {
    title: "Returns & Refunds",
    items: [
      "We offer a 14-day return policy from the date of delivery.",
      "Items must be unused and in original condition with original packaging.",
      "To initiate a return, contact us at visionthruoptics@gmail.com or call +91 7305319309.",
      "Refunds are processed within 5–7 business days via the original payment method.",
      "Contact lenses cannot be returned once opened for hygiene reasons."
    ]
  },
  {
    title: "Warranty",
    items: [
      "All frames come with a 1-year manufacturer warranty against defects.",
      "Warranty does not cover physical damage, scratches, or accidental breakage."
    ]
  },
  {
    title: "Limitation of liability",
    items: [
      "We are not responsible for any indirect or consequential loss arising from the use of our website or products."
    ]
  },
  {
    title: "Governing law",
    items: [
      "These terms are governed by the laws of India.",
      "Any disputes shall be subject to the jurisdiction of courts in Chennai, Tamil Nadu."
    ]
  }
];

export default function TermsPage() {
  const shop = getShopConfig();

  return (
    <StoreShell>
      <main className="bg-white py-14">
        <div className="container-page max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
            Legal
          </p>
          <h1 className="mt-2 font-display text-5xl font-bold leading-tight">
            Terms & Conditions — Vision Thru Optics Velachery
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
                {section.body ? (
                  <p className="mt-4 leading-7 text-optical-muted">
                    {section.body}
                  </p>
                ) : null}
                {section.items ? (
                  <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-optical-muted">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section>
              <h2 className="font-display text-2xl font-bold">9. Contact</h2>
              <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-optical-muted">
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
