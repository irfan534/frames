import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Owner login for Vision Thru Optics Velachery."
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-optical-fog px-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-soft">
        <div className="text-center">
          <Image
            src="/images/shoplogo.png"
            alt="Vision Thru Optics Velachery logo"
            width={144}
            height={144}
            className="mx-auto h-36 w-36 rounded-lg object-cover shadow-soft"
          />
          <h1 className="mt-4 font-display text-3xl font-bold">Owner Login</h1>
          <p className="mt-2 text-sm text-optical-muted">
            Login is restricted to the shop admin account.
          </p>
        </div>
        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
