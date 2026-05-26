import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
import { StoreShell } from "@/components/public/store-shell";
import { Button } from "@/components/ui/button";
import { getShopConfig } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit, call, or message Vision Thru Optics Velachery."
};

export default function ContactPage() {
  const shop = getShopConfig();

  return (
    <StoreShell>
      <main className="container-page py-12">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
            Contact
          </p>
          <h1 className="mt-2 font-display text-5xl font-bold">Come say hello</h1>
          <p className="mt-4 text-lg leading-8 text-optical-muted">
            Call, WhatsApp, or visit the shop for frame selection and lens advice.
          </p>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <div className="space-y-5">
              <p className="flex gap-3 text-optical-muted">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                {shop.address}
              </p>
              <p className="flex gap-3 text-optical-muted">
                <Phone className="mt-0.5 h-5 w-5 text-primary" />
                <a href={`tel:${shop.phone}`}>{shop.phone}</a>
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href={`https://wa.me/${shop.whatsappNumber}`}>
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">Browse Frames</Link>
              </Button>
              <Button asChild variant="outline">
                <a href={shop.googleMapsUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Google Maps
                </a>
              </Button>
            </div>
            <div className="mt-6 h-64 overflow-hidden rounded-lg border border-border bg-optical-fog">
              <iframe
                title={`${shop.name} location on Google Maps`}
                src={shop.googleMapsEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h2 className="font-display text-3xl font-bold">Send a message</h2>
            <div className="mt-5">
              <ContactForm />
            </div>
          </section>
        </div>
      </main>
    </StoreShell>
  );
}
