import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { checkOrigin } from "@/lib/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { shopPhotosSchema } from "@/lib/validations";

export async function POST(request: Request) {
  await requireAdmin();
  if (!(await checkOrigin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payload = await request.json().catch(() => null);
  const parsed = shopPhotosSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid shop photos" },
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

  const { error: deleteError } = await supabase
    .from("shop_photos")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    return NextResponse.json({ error: formatShopPhotoError(deleteError.message) }, { status: 400 });
  }

  const rows = parsed.data.photos.map((imageUrl, index) => ({
    image_url: imageUrl,
    display_order: index
  }));

  const { error } = await supabase.from("shop_photos").insert(rows);

  if (error) {
    return NextResponse.json({ error: formatShopPhotoError(error.message) }, { status: 400 });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/shop-photos");
  revalidatePath("/contact");
  return NextResponse.json({ ok: true });
}

function formatShopPhotoError(message: string) {
  if (message.includes("shop_photos")) {
    return "Run the updated Supabase schema before saving shop photos.";
  }

  return message;
}
