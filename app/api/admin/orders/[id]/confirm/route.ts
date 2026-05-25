import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { checkOrigin } from "@/lib/csrf";
import { parseFinalOrderTotal } from "@/lib/orders";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  await requireAdmin();
  if (!(await checkOrigin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/sales");
  revalidatePath("/products");

  return NextResponse.json({ ok: true });
}
