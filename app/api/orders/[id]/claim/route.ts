import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: Context) {
  const { id } = await context.params;
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
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data) {
    return NextResponse.json({ ok: true });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("payment_status")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 400 });
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.payment_status === "payment_claimed") {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Payment can only be claimed while the order is pending." },
    { status: 400 }
  );
}
