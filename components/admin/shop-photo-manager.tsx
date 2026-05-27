"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShopPhoto } from "@/lib/types";

const maxShopPhotos = 10;

export function ShopPhotoManager({ photos }: { photos: ShopPhoto[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrls, setPhotoUrls] = useState(() => photos.map((photo) => photo.image_url));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function uploadPhotos(files: FileList | null) {
    if (!files?.length) return;

    const nextFiles = Array.from(files);
    if (photoUrls.length + nextFiles.length > maxShopPhotos) {
      toast.error(`Use up to ${maxShopPhotos} shop photos`);
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of nextFiles) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("folder", "shop-photos");

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Photo upload failed");
        uploadedUrls.push(result.url);
      }

      setPhotoUrls((current) =>
        Array.from(new Set([...current, ...uploadedUrls])).slice(0, maxShopPhotos)
      );
      toast.success("Shop photos uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removePhoto(index: number) {
    setPhotoUrls((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function savePhotos() {
    if (photoUrls.length === 0) {
      toast.error("Upload at least 1 shop photo");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/shop-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: photoUrls })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save shop photos");

      toast.success("Shop photos saved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photoUrls.length >= maxShopPhotos}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Photos"}
        </Button>
        <Button
          type="button"
          onClick={savePhotos}
          disabled={saving || uploading || photoUrls.length === 0}
        >
          {saving ? "Saving..." : "Save Gallery"}
        </Button>
        <span className="self-center text-sm font-semibold text-optical-muted">
          {photoUrls.length}/{maxShopPhotos}
        </span>
        <Input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={(event) => uploadPhotos(event.target.files)}
        />
      </div>

      {photoUrls.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photoUrls.map((url, index) => (
            <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-optical-fog">
              <Image
                src={url}
                alt={`Shop photo ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 220px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => removePhoto(index)}
                aria-label={`Remove shop photo ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-border bg-optical-fog text-center">
          <div>
            <ImageIcon className="mx-auto h-8 w-8 text-optical-muted" />
            <p className="mt-3 text-sm font-semibold text-optical-muted">
              No shop photos uploaded
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
