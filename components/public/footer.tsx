import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import { getShopConfig } from "@/lib/utils";

export function PublicFooter() {
  const shop = getShopConfig();

  return (
    <footer className="bg-optical-ink text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src="/images/vision-thru-optics-logo.webp"
              alt={`${shop.name} logo`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-md object-cover"
            />
            <span className="font-display text-xl font-bold">{shop.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/68">
            Premium frames, honest recommendations, and personal optical care
            from a family-run shop.
          </p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Facebook, Send].map((Icon, index) => (
              <span
                key={index}
                className="grid h-10 w-10 place-items-center rounded-md border border-white/12 bg-white/5"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/55">
            Shop
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li><Link href="/products">All Products</Link></li>
            <li><Link href="/products?category=Eyeglasses">Eyeglasses</Link></li>
            <li><Link href="/products?category=Sunglasses">Sunglasses</Link></li>
            <li><Link href="/products?category=Contact%20Lenses">Contact Lenses</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/55">
            Company
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/cart">Cart</Link></li>
            <li><Link href="/admin">Admin</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/55">
            Visit
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4" /> {shop.address}</li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4" /> {shop.phone}</li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4" /> hello@visionthruoptics.local</li>
          </ul>
          <div className="mt-5 flex gap-2 text-xs font-bold">
            <span className="rounded bg-white px-2 py-1 text-optical-ink">GPay</span>
            <span className="rounded bg-white px-2 py-1 text-optical-ink">PhonePe</span>
            <span className="rounded bg-white px-2 py-1 text-optical-ink">UPI</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-page text-sm text-white/55">
          Copyright {new Date().getFullYear()} {shop.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
