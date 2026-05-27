import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Camera, MessageCircle } from "lucide-react";
import { StoreShell } from "@/components/public/store-shell";
import { Button } from "@/components/ui/button";
import { getShopPhotos } from "@/lib/data";
import { getShopConfig } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop Photos",
  description: "See photos of Vision Thru Optics Velachery before you visit."
};

export default async function ShopPhotosPage() {
  const photos = await getShopPhotos();
  const shop = getShopConfig();

  return (
    <StoreShell>
      <main className="container-page py-12">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
              Shop Photos
            </p>
            <h1 className="mt-2 font-display text-5xl font-bold">
              See the shop before you visit
            </h1>
            <p className="mt-4 text-lg leading-8 text-optical-muted">
              A quick look at the store, displays, and frame selection at {shop.name}.
            </p>
          </div>
          <Button asChild>
            <a href={`https://wa.me/${shop.whatsappNumber}`}>
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        </div>

        {photos.length ? (
          <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-optical-fog shadow-sm"
              >
                <Image
                  src={photo.image_url}
                  alt={`${shop.name} shop photo ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </section>
        ) : (
          <section className="mt-9 grid min-h-72 place-items-center rounded-lg border border-dashed border-border bg-white text-center">
            <div className="max-w-sm px-6">
              <Camera className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-display text-3xl font-bold">
                Photos coming soon
              </h2>
              <p className="mt-3 text-optical-muted">
                Contact the shop directly for current frames and visit details.
              </p>
              <Button asChild className="mt-5">
                <Link href="/contact">Contact Shop</Link>
              </Button>
            </div>
          </section>
        )}
      </main>
    </StoreShell>
  );
}
