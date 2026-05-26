import { NextResponse } from "next/server";
import { logError, logInfo } from "@/lib/logger";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { orderStatusSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

const claimRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5
});

export async function PATCH(request: Request, context: Context) {
  const rateLimit = claimRateLimit.check(getClientIp(request.headers));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many payment claims. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000))
        }
      }
    );
  }

  const { id } = await context.params;
  const parsed = orderStatusSchema.safeParse({ id });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role is not configured." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status: "payment_claimed" })
    .eq("id", id)
    .eq("payment_status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    logError("claim", error, { orderId: id });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data) {
    logInfo("claim", "payment claimed", { orderId: id });
    return NextResponse.json({ ok: true });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("payment_status")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    logError("claim", orderError, { orderId: id });
    return NextResponse.json({ error: orderError.message }, { status: 400 });
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.payment_status === "payment_claimed") {
    logInfo("claim", "payment claimed", { orderId: id });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Payment can only be claimed while the order is pending." },
    { status: 400 }
  );
}
