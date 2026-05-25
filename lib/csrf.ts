import { headers } from "next/headers";

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

function originsMatch(source: string, allowed: string) {
  if (!allowed) return false;

  try {
    return new URL(source).origin === new URL(withProtocol(allowed)).origin;
  } catch {
    return false;
  }
}

function withProtocol(url: string) {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(url) ? url : `https://${url}`;
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}
