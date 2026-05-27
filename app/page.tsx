import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { CategoryStrip } from "@/components/public/category-strip";
import { ProductCard } from "@/components/public/product-card";
import { StoreShell } from "@/components/public/store-shell";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/data";

export default async function HomePage() {
  const trending = await getProducts({ limit: 4, sort: "popular" });

  return (
    <StoreShell>
      <main>
        <section className="hero-mesh overflow-hidden text-white">
          <div className="container-page grid min-h-[620px] items-center gap-10 py-14 lg:grid-cols-[1fr_520px]">
            <div className="max-w-2xl">
              <p className="animate-fade-up text-sm font-bold uppercase tracking-[0.26em] text-white/60">
                Premium optical care
              </p>
              <h1 className="mt-5 animate-fade-up font-display text-5xl font-bold leading-[1.02] sm:text-7xl">
                See the World in Style
              </h1>
              <p className="mt-5 max-w-xl animate-fade-up text-lg leading-8 text-white/74 [animation-delay:130ms]">
                Curated frames, sunglasses, lenses, and family-first service with
                simple WhatsApp ordering and QR payments.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-white text-optical-ink hover:bg-white/92">
                  <Link href="/products">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/24 text-white hover:bg-white/10">
                  <Link href="/products?sort=new">Explore Collection</Link>
                </Button>
              </div>
            </div>
            <div className="relative min-h-[420px]">
              <div className="absolute inset-0 rounded-[28px] bg-white/10" />
              {/*
                Photo by GlassesShop on Unsplash
                https://unsplash.com/photos/OOUtDEzroy8?utm_source=vision_thru_optics&utm_medium=referral
                Free to use under Unsplash License — commercial use allowed
              */}
              <Image
                src="https://images.unsplash.com/photo-1739758443031-8d1cfc897236?auto=format&fit=crop&w=1200&q=88"
                alt="A man wearing glasses and a brown shirt"
                fill
                priority
                sizes="(min-width: 1024px) 520px, 100vw"
                className="rounded-[28px] object-cover shadow-2xl"
              />
              <div className="absolute bottom-5 left-5 rounded-lg bg-white/92 p-4 text-optical-text shadow-soft backdrop-blur">
                <p className="text-sm font-bold">Starting at Rs. 999</p>
                <p className="mt-1 text-xs text-optical-muted">Free home try-on available</p>
              </div>
            </div>
          </div>
        </section>

        <CategoryStrip />

        <ProductSection
          eyebrow="Trending Frames"
          title="Fresh styles for everyday clarity"
          products={trending.products}
        />

        <section className="bg-primary py-10 text-white">
          <div className="container-page flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/62">
                Limited store offer
              </p>
              <h2 className="mt-2 font-display text-4xl font-bold">
                Starting at Rs. 999 | Free Home Try-On
              </h2>
            </div>
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/products">Shop the offer</Link>
            </Button>
          </div>
        </section>

        <section className="bg-white py-10">
          <div className="container-page grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: "Free Delivery" },
              { icon: ShieldCheck, title: "1 Year Warranty" },
              { icon: RotateCcw, title: "14-Day Returns" },
              { icon: BadgeCheck, title: "100% Authentic" }
            ].map(({ icon: Icon, title }) => (
              <div key={title} className="flex items-center gap-4 rounded-lg border border-border bg-optical-shell p-5">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-semibold">{title}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="container-page">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
              Reviews
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold">
              Loved by local families
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                [
                  "Nafees Nafees",
                  "I am satisfied with the specs and sunglasses. Worth for money, excellent service."
                ],
                [
                  "Vijaya Kumari",
                  "Best shop 🤩 frame colour and quality best in the market. Regular customer more than 15 yrs just give a visit and try see the result. 💗💗💗"
                ],
                [
                  "Ajit Singh",
                  "Friendly and knowledgeable. Has always suggested me nothing more than what is required ..."
                ]
              ].map(([name, review]) => (
                <article key={name} className="rounded-lg border border-border bg-optical-shell p-5">
                  <div className="text-gold">★★★★★</div>
                  <p className="mt-3 leading-7 text-optical-muted">{review}</p>
                  <p className="mt-4 font-semibold">{name}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}

function ProductSection({
  eyebrow,
  title,
  products
}: {
  eyebrow: string;
  title: string;
  products: Awaited<ReturnType<typeof getProducts>>["products"];
}) {
  return (
    <section className="py-14">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold">{title}</h2>
          </div>
          <Link href="/products" className="hidden text-sm font-bold text-primary sm:block">
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((frame) => (
            <ProductCard key={frame.id} frame={frame} />
          ))}
        </div>
      </div>
    </section>
  );
}
