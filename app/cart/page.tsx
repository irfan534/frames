import type { Metadata } from "next";
import { CartView } from "@/components/public/cart-view";
import { StoreShell } from "@/components/public/store-shell";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected frames before checkout."
};

export default function CartPage() {
  return (
    <StoreShell>
      <CartView />
    </StoreShell>
  );
}
