import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getShopConfig } from "@/lib/utils";
import { logError, logInfo } from "@/lib/logger";
import { buildOrderItems } from "@/lib/orders";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const orderRateLimit = createRateLimiter({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX
});

export async function POST(request: Request) {
  const headersList = await headers();
  const rateLimit = orderRateLimit.check(getClientIp(headersList));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many orders. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000))
        }
      }
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid checkout details" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role is not configured." },
      { status: 503 }
    );
  }

  const ids = parsed.data.items.map((item) => item.frameId);
  const { data: frames, error: frameError } = await supabase
    .from("frames")
    .select("id,frame_code,name,brand,category,description,price,quantity,image_url,is_active,created_at,updated_at")
    .in("id", ids)
    .eq("is_active", true);

  if (frameError) {
    return NextResponse.json({ error: frameError.message }, { status: 500 });
  }

  const builtOrder = buildOrderItems(parsed.data.items, frames || []);
  if (!builtOrder.ok) {
    return NextResponse.json(
      { error: builtOrder.error },
      { status: builtOrder.status }
    );
  }

  const { orderItems, total } = builtOrder;
  const address =
    parsed.data.fulfillment_method === "pickup"
      ? `Store Pickup - ${getShopConfig().address}`
      : [
          parsed.data.address,
          parsed.data.city,
          parsed.data.state,
          parsed.data.pincode
        ]
          .filter(Boolean)
          .join(", ");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: parsed.data.customer_name,
      phone: parsed.data.phone,
      address,
      notes: parsed.data.notes || null,
      total_amount: total,
      payment_status: "pending",
      order_status: "pending"
    })
    .select("id")
    .single();

  if (orderError || !order) {
    logError("orders", orderError || "Order could not be created");
    return NextResponse.json(
      { error: orderError?.message || "Order could not be created" },
      { status: 500 }
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map((item) => ({
      order_id: order.id,
      frame_id: item.frame.id,
      qty: item.qty,
      price: item.price
    }))
  );

  if (itemsError) {
    logError("orders", itemsError, { orderId: order.id });
    await supabase.from("orders").update({ order_status: "cancelled" }).eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  logInfo("orders", "order created", { orderId: order.id });

  return NextResponse.json({
    orderId: order.id,
    total
  });
}
