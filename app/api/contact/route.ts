import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/logger";

const contactRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5
});

export async function POST(request: Request) {
  const headersList = await headers();
  const rateLimit = contactRateLimit.check(getClientIp(headersList));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000))
        }
      }
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid message" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    if (error) {
      logError("contact", error, { email: parsed.data.email });
    }
  }

  return NextResponse.json({ ok: true });
}
