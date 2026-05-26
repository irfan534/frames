import { headers } from "next/headers";
import { originsMatch } from "@/lib/csrf-core";

export async function checkOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin") ?? h.get("referer") ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const host = firstHeaderValue(h.get("x-forwarded-host") ?? h.get("host"));
  const protocol = firstHeaderValue(h.get("x-forwarded-proto")) || "https";

  if (!origin) return !siteUrl;

  return (
    originsMatch(origin, siteUrl) ||
    originsMatch(origin, host ? `${protocol}://${host}` : "")
  );
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}
