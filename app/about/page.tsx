import type { Metadata } from "next";
import Image from "next/image";
import { Award, HeartHandshake, Sparkles } from "lucide-react";
import { StoreShell } from "@/components/public/store-shell";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the family-run optical shop behind Vision Thru Optics Velachery."
};

export default function AboutPage() {
  return (
    <StoreShell>
      <main>
        <section className="bg-white py-14">
          <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_520px]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
                Our Story
              </p>
              <h1 className="mt-2 font-display text-5xl font-bold leading-tight">
                Optical care that still feels personal
              </h1>
              <p className="mt-5 text-lg leading-8 text-optical-muted">
                Vision Thru Optics Velachery is built for a small family shop: clear
                inventory, simple WhatsApp ordering, manual payment confidence,
                and warm service from the person who knows every product on the shelf.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-optical-fog">
              <Image
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85"
                alt="Family optical shop team"
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container-page grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="font-display text-4xl font-bold">Our Mission</h2>
            <p className="text-lg leading-8 text-optical-muted">
              Help every customer find eyewear that fits their face, budget, and
              daily life, while keeping the shop owner in full control of stock,
              payment confirmation, and customer follow-up.
            </p>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container-page grid gap-5 md:grid-cols-3">
            {[
              { icon: HeartHandshake, title: "Family-first service" },
              { icon: Sparkles, title: "Premium product curation" },
              { icon: Award, title: "Practical, honest advice" }
            ].map(({ icon: Icon, title }) => (
              <div key={title} className="rounded-lg border border-border bg-optical-shell p-6">
                <Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
