"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { checkoutSchema } from "@/lib/validations";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency, framePrimaryImage, getShopConfig } from "@/lib/utils";

type CheckoutFields = Omit<z.infer<typeof checkoutSchema>, "items">;

export function CheckoutForm() {
  const router = useRouter();
  const shop = getShopConfig();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"delivery" | "pickup">("delivery");

  const total = subtotal();
  const orderItems = useMemo(
    () => items.map((item) => ({ frameId: item.id, qty: item.cartQty })),
    [items]
  );

  async function onSubmit(formData: FormData) {
    const values: CheckoutFields = {
      customer_name: String(formData.get("customer_name") || ""),
      phone: String(formData.get("phone") || ""),
      fulfillment_method: formData.get("fulfillment_method") === "pickup" ? "pickup" : "delivery",
      address: String(formData.get("address") || ""),
      pincode: String(formData.get("pincode") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      notes: String(formData.get("notes") || "")
    };

    const parsed = checkoutSchema.safeParse({ ...values, items: orderItems });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Order could not be created");
      }

      clearCart();
      toast.success("Order created. Complete your UPI payment.");
      router.push(`/checkout/success?orderId=${encodeURIComponent(result.orderId)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
        <div>
          <h1 className="font-display text-4xl font-bold">No items to checkout</h1>
          <p className="mt-3 text-optical-muted">Add a frame before placing an order.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Shop Frames</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_390px]">
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
          Checkout
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Order details</h1>
        <form action={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field name="customer_name" label="Full Name" error={errors.customer_name} />
          <Field name="phone" label="Phone Number" error={errors.phone} />

          <fieldset className="md:col-span-2">
            <legend className="text-sm font-medium">Choose fulfilment option</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <FulfillmentOption
                checked={fulfillmentMethod === "delivery"}
                value="delivery"
                label="Delivery"
                detail="Deliver to your address"
                onChange={() => setFulfillmentMethod("delivery")}
              />
              <FulfillmentOption
                checked={fulfillmentMethod === "pickup"}
                value="pickup"
                label="Store Pickup"
                detail="Collect from our Velachery store"
                onChange={() => setFulfillmentMethod("pickup")}
              />
            </div>
          </fieldset>

          {fulfillmentMethod === "delivery" ? (
            <>
              <div className="md:col-span-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea id="address" name="address" className="mt-2" />
                {errors.address ? <ErrorText>{errors.address}</ErrorText> : null}
              </div>
              <Field name="pincode" label="Pincode" error={errors.pincode} />
              <Field name="city" label="City" error={errors.city} />
              <Field name="state" label="State" error={errors.state} />
            </>
          ) : (
            <div className="md:col-span-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-bold text-primary">Store Pickup</p>
              <p className="mt-2 text-sm text-optical-muted">
                Collect your order from {shop.name}, {shop.address}.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" className="mt-2" />
          </div>

          <div className="md:col-span-2 rounded-lg bg-optical-fog p-4">
            <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
              <div className="rounded-md bg-white p-3">
                <Image
                  src={shop.qrImage}
                  alt="UPI payment QR"
                  width={260}
                  height={260}
                  className="h-auto w-full"
                />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">QR Payment</h2>
                <p className="mt-2 text-sm leading-6 text-optical-muted">
                  Scan to pay with Google Pay or PhonePe. After placing the
                  order, confirm payment from the next screen.
                </p>
                <p className="mt-4 text-2xl font-bold">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          <Button disabled={loading} className="md:col-span-2">
            <QrCode className="h-4 w-4" />
            {loading ? "Creating order..." : "Place Order & Pay by UPI"}
          </Button>
        </form>
      </section>

      <aside className="h-max rounded-lg border border-border bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-display text-2xl font-bold">Order Summary</h2>
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[72px_1fr_auto] gap-3">
              <div className="relative aspect-square overflow-hidden rounded-md bg-optical-fog">
                <Image
                  src={framePrimaryImage(item)}
                  alt={item.name}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold leading-tight">{item.name}</p>
                <p className="mt-1 text-sm text-optical-muted">Qty {item.cartQty}</p>
              </div>
              <p className="font-semibold">{formatCurrency(Number(item.price) * item.cartQty)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </aside>
    </main>
  );
}

function Field({
  name,
  label,
  error
}: {
  name: keyof CheckoutFields;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} className="mt-2" />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}

function FulfillmentOption({
  checked,
  value,
  label,
  detail,
  onChange
}: {
  checked: boolean;
  value: "delivery" | "pickup";
  label: string;
  detail: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-md border p-4 transition ${
        checked ? "border-primary bg-primary/5" : "border-border bg-white"
      }`}
    >
      <input
        type="radio"
        name="fulfillment_method"
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-primary"
      />
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="mt-1 block text-sm text-optical-muted">{detail}</span>
      </span>
    </label>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-sm text-red-600">{children}</p>;
}
