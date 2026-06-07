"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const configurationMessage =
    process.env.NODE_ENV === "production"
      ? "Supabase is not configured. Add the Supabase environment variables in Vercel, then redeploy."
      : "Supabase is not configured. Add `.env.local` values from `.env.example`.";

  async function login(formData: FormData) {
    if (!configured) {
      toast.error("Configure Supabase env vars before logging in.");
      return;
    }

    setLoading(true);
    setConnectionError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || "")
        })
      });
      const result = await response.json().catch(() => ({
        error: "Login could not be completed."
      }));

      if (!response.ok) {
        const message = String(result.error || "Login could not be completed.");
        if (response.status === 503) setConnectionError(message);
        toast.error(message);
        return;
      }
    } catch {
      const message =
        "Unable to reach the login service. Please try again.";
      setConnectionError(message);
      toast.error(message);
      return;
    } finally {
      setLoading(false);
    }

    window.location.assign(getAdminRedirect(searchParams.get("next")));
  }

  return (
    <form action={login} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" className="mt-2" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" className="mt-2" />
      </div>
      {!configured ? (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          {configurationMessage}
        </p>
      ) : null}
      {connectionError ? (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {connectionError}
        </p>
      ) : null}
      <Button disabled={loading} className="w-full">
        <Lock className="h-4 w-4" />
        {loading ? "Signing in..." : "Login"}
      </Button>
    </form>
  );
}

function getAdminRedirect(next: string | null) {
  if (next?.startsWith("/admin") && !next.startsWith("/admin/login")) {
    return next;
  }

  return "/admin";
}
