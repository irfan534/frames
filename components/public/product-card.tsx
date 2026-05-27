import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { AddToCartButton } from "@/components/public/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import type { Frame } from "@/lib/types";
import { formatCurrency, frameColors, framePrimaryImage } from "@/lib/utils";

export function ProductCard({ frame }: { frame: Frame }) {
  const image = framePrimaryImage(frame);
  const colors = frameColors(frame);
  const mrp = Math.round(Number(frame.price) * 1.22);

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/products/${frame.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-optical-fog">
          <Image
            src={image}
            alt={frame.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex max-w-[calc(100%-72px)] flex-col items-start gap-2">
            {frame.offer_label ? (
              <Badge
                variant={frame.offer_type === "combo" ? "warning" : "blue"}
                className="shadow-sm"
              >
                {frame.offer_label}
              </Badge>
            ) : null}
            {frame.brand ? (
              <Badge className="bg-white text-optical-text shadow-sm">
                {frame.brand}
              </Badge>
            ) : null}
          </div>
          <button className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/92 text-optical-text shadow-sm">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Wishlist</span>
          </button>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${frame.id}`}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {frame.category || "Frames"}
          </p>
          <h3 className="mt-2 line-clamp-1 font-semibold">{frame.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold">{formatCurrency(frame.price)}</span>
          <span className="text-sm text-optical-muted line-through">
            MRP {formatCurrency(mrp)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          {colors.length ? (
            <div className="flex gap-1.5">
              {colors.map((color) => (
                <Link
                  key={color}
                  href={`/products?color=${encodeURIComponent(color)}`}
                  className="h-4 w-4 rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                  aria-label={`Show ${color} frames`}
                />
              ))}
            </div>
          ) : null}
          <div className="ml-auto">
            <AddToCartButton frame={frame} label="Add" />
          </div>
        </div>
      </div>
    </article>
  );
}
