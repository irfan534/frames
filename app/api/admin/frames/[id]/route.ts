import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { frameSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
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

  const imageUrls = parsed.data.image_urls.length
    ? parsed.data.image_urls
    : parsed.data.image_url
      ? [parsed.data.image_url]
      : [];

  const row = {
    ...parsed.data,
    brand: parsed.data.brand || null,
    category: parsed.data.category || null,
    description: parsed.data.description || null,
    image_url: imageUrls[0] || null,
    image_urls: imageUrls
  };

  let { error } = await supabase
    .from("frames")
    .update(row)
    .eq("id", id);

  if (isMissingImageUrlsColumn(error) && imageUrls.length <= 1) {
    const legacyRow = withoutImageUrls(row);
    ({ error } = await supabase
      .from("frames")
      .update(legacyRow)
      .eq("id", id));
  }

  if (error) {
    return NextResponse.json({ error: formatFrameSaveError(error.message) }, { status: 400 });
  }

  revalidatePath("/admin/inventory");
  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

function isMissingImageUrlsColumn(error: { message?: string } | null) {
  return Boolean(error?.message?.includes("image_urls"));
}

function formatFrameSaveError(message: string) {
  if (message.includes("image_urls")) {
    return "Run the updated Supabase schema before saving multiple frame images.";
  }

  return message;
}

function withoutImageUrls<T extends { image_urls: string[] }>(row: T) {
  const { image_urls, ...legacyRow } = row;
  void image_urls;
  return legacyRow;
}

export async function DELETE(_request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role is not configured." },
      { status: 503 }
    );
  }

  const { error } = await supabase
    .from("frames")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
