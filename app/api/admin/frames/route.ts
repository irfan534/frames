import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { frameSchema } from "@/lib/validations";

export async function POST(request: Request) {
  await requireAdmin();
  const payload = await request.json().catch(() => null);
  const parsed = frameSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid frame details" },
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

  const { error } = await supabase.from("frames").insert({
    ...parsed.data,
    brand: parsed.data.brand || null,
    category: parsed.data.category || null,
    description: parsed.data.description || null,
    image_url: parsed.data.image_url || null
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
