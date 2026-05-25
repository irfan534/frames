import type { Metadata } from "next";
import { CheckoutForm } from "@/components/public/checkout-form";
import { StoreShell } from "@/components/public/store-shell";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Place your optical order and continue on WhatsApp."
};

export default function CheckoutPage() {
  return (
    <StoreShell>
      <CheckoutForm />
    </StoreShell>
  );
}
