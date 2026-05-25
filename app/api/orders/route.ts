import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateWhatsAppMessage, generateWhatsAppUrl } from "@/lib/whatsapp";
import { getShopConfig } from "@/lib/utils";

export async function POST(request: Request) {
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

  const frameMap = new Map((frames || []).map((frame) => [frame.id, frame]));
  const orderItems = [];

  for (const item of parsed.data.items) {
    const frame = frameMap.get(item.frameId);
    if (!frame) {
      return NextResponse.json(
        { error: "One or more products are unavailable." },
        { status: 400 }
      );
    }
    if (item.qty > frame.quantity) {
      return NextResponse.json(
        { error: `${frame.name} has only ${frame.quantity} in stock.` },
        { status: 400 }
      );
    }
    orderItems.push({
      frame,
      qty: item.qty,
      price: Number(frame.price)
    });
  }

  const total = orderItems.reduce(
    (sum, item) => sum + Number(item.frame.price) * item.qty,
    0
  );
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
    await supabase.from("orders").update({ order_status: "cancelled" }).eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const message = generateWhatsAppMessage({
    name: parsed.data.customer_name,
    phone: parsed.data.phone,
    fulfillmentMethod: parsed.data.fulfillment_method,
    address,
    notes: parsed.data.notes,
    total,
    items: orderItems.map((item) => ({
      id: "",
      order_id: order.id,
      frame_id: item.frame.id,
      qty: item.qty,
      price: item.price,
      frames: {
        name: item.frame.name,
        frame_code: item.frame.frame_code
      }
    }))
  });

  return NextResponse.json({
    orderId: order.id,
    total,
    whatsappUrl: generateWhatsAppUrl(message)
  });
}
