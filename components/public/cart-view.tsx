"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency, imageFallback } from "@/lib/utils";

export function CartView() {
  const { items, removeItem, updateQty, subtotal } = useCartStore();
  const total = subtotal();

  if (items.length === 0) {
    return (
      <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
        <div className="max-w-md">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-white shadow-soft">
            <span className="font-display text-4xl font-bold text-primary">0</span>
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold">Your cart is empty</h1>
          <p className="mt-3 text-optical-muted">
            Find frames that fit your face, your workday, and your weekend.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="font-display text-4xl font-bold">Shopping Cart</h1>
        <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-white">
          {items.map((item) => (
            <div key={item.id} className="grid gap-4 p-4 sm:grid-cols-[110px_1fr_auto]">
              <div className="relative aspect-square overflow-hidden rounded-md bg-optical-fog">
                <Image
                  src={item.image_url || imageFallback(item.frame_code)}
                  alt={item.name}
                  fill
                  sizes="110px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {item.brand || "ClearView"}
                </p>
                <h2 className="mt-1 font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-optical-muted">{item.category}</p>
                <div className="mt-4 inline-flex h-10 items-center rounded-md border border-border">
                  <button
                    className="grid h-10 w-10 place-items-center"
                    onClick={() => updateQty(item.id, item.cartQty - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="grid h-10 w-10 place-items-center font-semibold">
                    {item.cartQty}
                  </span>
                  <button
                    className="grid h-10 w-10 place-items-center"
                    onClick={() => updateQty(item.id, item.cartQty + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 sm:flex-col sm:items-end">
                <p className="font-bold">{formatCurrency(Number(item.price) * item.cartQty)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="h-max rounded-lg border border-border bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-display text-2xl font-bold">Summary</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-optical-muted">Subtotal</span>
            <span className="font-semibold">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-optical-muted">Delivery</span>
            <span className="font-semibold">Free</span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex justify-between text-base font-bold">
              <span>Estimated total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        <Button asChild className="mt-6 w-full">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </aside>
    </main>
  );
}
