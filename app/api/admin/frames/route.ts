import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { checkOrigin } from "@/lib/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { frameSchema } from "@/lib/validations";

export async function POST(request: Request) {
  await requireAdmin();
  if (!(await checkOrigin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    image_urls: imageUrls,
    colors: parsed.data.colors
  };

  let { error } = await supabase.from("frames").insert(row);
  if (isMissingOptionalFrameColumn(error) && imageUrls.length <= 1 && row.colors.length === 0) {
    const legacyRow = withoutImageUrls(row);
    const { colors, ...rowWithoutOptionalColumns } = legacyRow;
    void colors;
    ({ error } = await supabase.from("frames").insert(rowWithoutOptionalColumns));
  }

  if (error) {
    return NextResponse.json({ error: formatFrameSaveError(error.message) }, { status: 400 });
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

function isMissingOptionalFrameColumn(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("image_urls") ||
    error?.message?.includes("colors")
  );
}

function formatFrameSaveError(message: string) {
  if (message.includes("colors")) {
    return "Run the updated Supabase schema before saving frame colors.";
  }

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
