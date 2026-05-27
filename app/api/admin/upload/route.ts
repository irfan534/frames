import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { imageUploadSchema } from "@/lib/validations";

export async function POST(request: Request) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const parsed = imageUploadSchema.safeParse({
    fileName: file.name,
    mimeType: file.type,
    size: file.size
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid image" },
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

  const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
  const uploadFolder = formData.get("folder") === "shop-photos" ? "shop-photos" : "frames";
  const path = `${uploadFolder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("frame-images").upload(path, file, {
    contentType: file.type,
    upsert: false
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data } = supabase.storage.from("frame-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
