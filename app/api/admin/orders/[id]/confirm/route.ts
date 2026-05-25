import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { parseFinalOrderTotal } from "@/lib/orders";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role is not configured." },
      { status: 503 }
    );
  }

  const payload = await request.json().catch(() => null);
  const finalTotal = parseFinalOrderTotal(payload?.totalAmount);

  if (!finalTotal.ok) {
    return NextResponse.json(
      { error: finalTotal.error },
      { status: 400 }
    );
  }

  const { error } = await supabase.rpc("confirm_order_payment", {
    final_total_amount: finalTotal.total,
    target_order_id: id
  });

  if (error) {
    if (isMissingFinalTotalRpc(error.message)) {
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("id,qty,price")
        .eq("order_id", id);

      if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 400 });
      }

      const adjustedItems = distributeFinalTotal(orderItems || [], finalTotal.total);
      if (!adjustedItems.ok) {
        return NextResponse.json({ error: adjustedItems.error }, { status: 400 });
      }

      const { error: totalError } = await supabase
        .from("orders")
        .update({ total_amount: finalTotal.total })
        .eq("id", id)
        .eq("payment_status", "pending");

      if (totalError) {
        return NextResponse.json({ error: totalError.message }, { status: 400 });
      }

      for (const item of adjustedItems.items) {
        const { error: itemError } = await supabase
          .from("order_items")
          .update({ price: item.price })
          .eq("id", item.id);

        if (itemError) {
          return NextResponse.json({ error: itemError.message }, { status: 400 });
        }
      }

      const { error: legacyError } = await supabase.rpc("confirm_order_payment", {
        target_order_id: id
      });

      if (legacyError) {
        return NextResponse.json({ error: legacyError.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/sales");
  revalidatePath("/products");

  return NextResponse.json({ ok: true });
}

function isMissingFinalTotalRpc(message: string) {
  return (
    message.includes("confirm_order_payment") &&
    message.includes("schema cache") &&
    message.includes("final_total_amount")
  );
}

type LegacyOrderItem = {
  id: string;
  price: number | string;
  qty: number;
};

function distributeFinalTotal(items: LegacyOrderItem[], finalTotal: number):
  | { ok: true; items: { id: string; price: number }[] }
  | { ok: false; error: string } {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  if (!items.length || !Number.isFinite(subtotal) || subtotal <= 0) {
    return { ok: false, error: "Order has no valid line items." };
  }

  let allocated = 0;
  const lastIndex = items.length - 1;

  return {
    ok: true,
    items: items.map((item, index) => {
      const lineTotal =
        index === lastIndex
          ? finalTotal - allocated
          : (finalTotal * Number(item.price) * item.qty) / subtotal;

      allocated += lineTotal;

      return {
        id: item.id,
        price: lineTotal / item.qty
      };
    })
  };
}
