"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!claimed) return;

    const timeout = window.setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [claimed, router]);

  async function claimPayment() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/claim`, {
        method: "PATCH"
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.error || "Payment confirmation could not be saved.");
        return;
      }

      setClaimed(true);
    } catch {
      setError("Payment confirmation could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (claimed) {
    return (
      <p className="text-sm font-medium text-primary">
        Thank you! We will confirm your order once payment is verified.
      </p>
    );
  }

  return (
    <>
      <button
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
        onClick={claimPayment}
        type="button"
      >
        {loading ? "Confirming..." : "I have paid"}
      </button>
      {error ? (
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}
    </>
  );
}
