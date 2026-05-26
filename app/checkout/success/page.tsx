import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClaimPaymentButton } from "@/app/checkout/success/claim-payment-button";
import { StoreShell } from "@/components/public/store-shell";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

type SearchParams = Promise<{ orderId?: string | string[] }>;
const orderIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata: Metadata = {
  title: "Payment"
};

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  if (!orderId || !orderIdPattern.test(orderId)) {
    redirect("/");
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return <OrderNotFound />;
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id,total_amount")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return <OrderNotFound />;
  }

  const qrUrl = process.env.NEXT_PUBLIC_UPI_QR_IMAGE_URL;

  return (
    <StoreShell>
      <main className="container-page grid min-h-[70vh] place-items-center py-10">
        <section className="w-full max-w-xl rounded-lg border border-border bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Payment
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold">Complete your UPI payment</h1>
          <p className="mt-3 text-optical-muted">
            Scan the QR and pay the exact order total.
          </p>

          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrUrl}
              alt="UPI payment QR"
              className="mx-auto mt-6 aspect-square w-full max-w-xs rounded-md border border-border object-contain p-3"
            />
          ) : (
            <div className="mx-auto mt-6 flex aspect-square w-full max-w-xs items-center justify-center rounded-md border border-dashed border-border bg-optical-fog p-5">
              <p className="text-sm font-medium text-optical-muted">
                UPI QR not configured. Contact the shop to get payment details.
              </p>
            </div>
          )}

          <p className="mt-6 text-sm font-medium text-optical-muted">Order total</p>
          <p className="mt-1 text-3xl font-bold">{formatCurrency(Number(order.total_amount))}</p>

          <div className="mt-6">
            <ClaimPaymentButton orderId={order.id} />
          </div>
        </section>
      </main>
    </StoreShell>
  );
}

function OrderNotFound() {
  return (
    <StoreShell>
      <main className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
        <h1 className="font-display text-4xl font-bold">Order not found</h1>
      </main>
    </StoreShell>
  );
}
