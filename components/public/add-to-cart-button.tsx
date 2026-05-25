"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import type { Frame } from "@/lib/types";

export function AddToCartButton({
  frame,
  qty = 1,
  full = false,
  label = "Add to Cart"
}: {
  frame: Frame;
  qty?: number;
  full?: boolean;
  label?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const disabled = frame.quantity <= 0;

  return (
    <Button
      className={full ? "w-full" : ""}
      disabled={disabled}
      onClick={() => {
        addItem(frame, qty);
        toast.success(`${frame.name} added to cart`);
      }}
    >
      <ShoppingBag className="h-4 w-4" />
      {disabled ? "Out of Stock" : label}
    </Button>
  );
}
