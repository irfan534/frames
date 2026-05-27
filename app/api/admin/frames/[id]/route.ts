import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { checkOrigin } from "@/lib/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { frameSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  await requireAdmin();
  if (!(await checkOrigin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  const offerType = parsed.data.offer_type || null;

  const row = {
    ...parsed.data,
    brand: parsed.data.brand || null,
    category: parsed.data.category || null,
    description: parsed.data.description || null,
    image_url: imageUrls[0] || null,
    image_urls: imageUrls,
    colors: parsed.data.colors,
    offer_type: offerType,
    offer_label: offerType ? parsed.data.offer_label || defaultOfferLabel(offerType) : null,
    offer_description: offerType ? parsed.data.offer_description || null : null
  };

  let { error } = await supabase
    .from("frames")
    .update(row)
    .eq("id", id);

  if (isMissingOfferColumn(error) && !hasOfferData(row)) {
    ({ error } = await supabase
      .from("frames")
      .update(withoutOfferColumns(row))
      .eq("id", id));
  }
  if (isMissingImageColorColumn(error) && canUseLegacyImageColumns(row)) {
    const compatibleRow = hasOfferData(row)
      ? withoutImageColorColumns(row)
      : withoutOptionalFrameColumns(row);
    ({ error } = await supabase
      .from("frames")
      .update(compatibleRow)
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

function isMissingImageColorColumn(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("image_urls") ||
    error?.message?.includes("colors")
  );
}

function isMissingOfferColumn(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("offer_type") ||
    error?.message?.includes("offer_label") ||
    error?.message?.includes("offer_description")
  );
}

function formatFrameSaveError(message: string) {
  if (
    message.includes("offer_type") ||
    message.includes("offer_label") ||
    message.includes("offer_description")
  ) {
    return "Run the updated Supabase schema before saving frame offers.";
  }

  if (message.includes("colors")) {
    return "Run the updated Supabase schema before saving frame colors.";
  }

  if (message.includes("image_urls")) {
    return "Run the updated Supabase schema before saving multiple frame images.";
  }

  return message;
}

function defaultOfferLabel(offerType: "custom" | "combo") {
  return offerType === "combo" ? "Combo Offer" : "Special Offer";
}

function canUseLegacyImageColumns(row: {
  image_urls: string[];
  colors: string[];
}) {
  return row.image_urls.length <= 1 && row.colors.length === 0;
}

function hasOfferData(row: {
  offer_type: string | null;
  offer_label: string | null;
  offer_description: string | null;
}) {
  return Boolean(row.offer_type || row.offer_label || row.offer_description);
}

function withoutOfferColumns<T extends {
  offer_type: string | null;
  offer_label: string | null;
  offer_description: string | null;
}>(row: T) {
  const { offer_type, offer_label, offer_description, ...compatibleRow } = row;
  void offer_type;
  void offer_label;
  void offer_description;
  return compatibleRow;
}

function withoutImageColorColumns<T extends {
  image_urls: string[];
  colors: string[];
}>(row: T) {
  const { image_urls, colors, ...compatibleRow } = row;
  void image_urls;
  void colors;
  return compatibleRow;
}

function withoutOptionalFrameColumns<T extends {
  image_urls: string[];
  colors: string[];
  offer_type: string | null;
  offer_label: string | null;
  offer_description: string | null;
}>(row: T) {
  const {
    image_urls,
    colors,
    offer_type,
    offer_label,
    offer_description,
    ...legacyRow
  } = row;
  void image_urls;
  void colors;
  void offer_type;
  void offer_label;
  void offer_description;
  return legacyRow;
}

export async function DELETE(_request: Request, context: Context) {
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
