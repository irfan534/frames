"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-optical-shell px-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Something went wrong
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold">
          We lost the frame for a second.
        </h1>
        <p className="mt-3 text-optical-muted">
          Try again, or return to the storefront.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
