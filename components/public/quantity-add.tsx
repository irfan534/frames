"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/public/add-to-cart-button";
import { useCartStore } from "@/lib/cart-store";
import type { Frame } from "@/lib/types";

export function QuantityAdd({ frame }: { frame: Frame }) {
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const max = Math.max(frame.quantity, 1);
  const disabled = frame.quantity <= 0;

  function buyNow() {
    addItem(frame, qty);
    toast.success(`${frame.name} added to checkout`);
    router.push("/checkout");
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">Quantity</p>
        <div className="mt-2 inline-flex h-11 items-center rounded-md border border-border bg-white">
          <button
            className="grid h-11 w-11 place-items-center"
            onClick={() => setQty((value) => Math.max(value - 1, 1))}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="grid h-11 w-12 place-items-center font-semibold">{qty}</span>
          <button
            className="grid h-11 w-11 place-items-center"
            onClick={() => setQty((value) => Math.min(value + 1, max))}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <AddToCartButton frame={frame} qty={qty} full />
      <Button variant="dark" className="w-full" disabled={disabled} onClick={buyNow}>
        {disabled ? "Out of Stock" : "Buy Now"}
      </Button>
    </div>
  );
}
