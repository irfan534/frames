import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { checkOrigin } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
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

  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "cancelled", order_status: "cancelled" })
    .eq("id", id)
    .neq("payment_status", "paid");

  if (error) {
    logError("admin.cancel-order", error, { orderId: id });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");

  return NextResponse.json({ ok: true });
}
