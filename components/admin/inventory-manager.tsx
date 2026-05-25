"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { StockBadge } from "@/components/admin/status-badges";
import type { Frame } from "@/lib/types";
import { categories } from "@/lib/constants";
import { formatCurrency, framePrimaryImage } from "@/lib/utils";

const maxFrameImages = 4;

export function InventoryManager({ frames }: { frames: Frame[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("new");
  const [editing, setEditing] = useState<Frame | null>(null);
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const filtered = frames.filter((frame) =>
      [frame.name, frame.brand, frame.frame_code, frame.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    if (sort === "stock") return filtered.sort((a, b) => a.quantity - b.quantity);
    if (sort === "price") return filtered.sort((a, b) => Number(b.price) - Number(a.price));
    return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [frames, query, sort]);

  async function removeFrame(frame: Frame) {
    if (!confirm(`Archive ${frame.name}?`)) return;
    const response = await fetch(`/api/admin/frames/${frame.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Could not archive frame");
      return;
    }
    toast.success("Frame archived");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-optical-muted" />
          <Input
            className="pl-9"
            placeholder="Search inventory"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="stock">Low stock</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((frame) => (
              <TableRow key={frame.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-md bg-optical-fog">
                      <Image
                        src={framePrimaryImage(frame)}
                        alt={frame.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{frame.name}</p>
                      <p className="text-xs text-optical-muted">{frame.frame_code}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{frame.category || "-"}</TableCell>
                <TableCell>{formatCurrency(frame.price)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <StockBadge quantity={frame.quantity} />
                    <span className="text-xs text-optical-muted">{frame.quantity} units</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditing(frame);
                        setOpen(true);
                      }}
                      aria-label="Edit frame"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFrame(frame)}
                      aria-label="Archive frame"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FrameDialog
        key={editing?.id || "new"}
        frame={editing}
        open={open}
        onOpenChange={setOpen}
        onSaved={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function FrameDialog({
  frame,
  open,
  onOpenChange,
  onSaved
}: {
  frame: Frame | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const initialCategory = frame?.category || "Eyeglasses";
  const hasCustomCategory = Boolean(frame?.category && !categories.includes(frame.category));
  const [category, setCategory] = useState(hasCustomCategory ? "Other" : initialCategory);
  const [customCategory, setCustomCategory] = useState(hasCustomCategory ? initialCategory : "");
  const [imageUrls, setImageUrls] = useState(() => {
    const existingUrls = frame?.image_urls?.length
      ? frame.image_urls
      : frame?.image_url
        ? [frame.image_url]
        : [];

    return [
      ...existingUrls.slice(0, maxFrameImages),
      ...Array(Math.max(maxFrameImages - existingUrls.length, 0)).fill("")
    ].slice(0, maxFrameImages);
  });

  function updateImageUrl(index: number, value: string) {
    setImageUrls((urls) => urls.map((url, currentIndex) => (
      currentIndex === index ? value : url
    )));
  }

  async function save(formData: FormData) {
    setLoading(true);
    const imageFiles = imageUrls.map((_, index) => {
      const file = formData.get(`image_file_${index + 1}`);
      return file instanceof File && file.size > 0 ? file : null;
    });

    try {
      const hasFiles = imageFiles.some(Boolean);
      if (hasFiles) {
        setUploading(true);
      }

      const finalImageUrls = [];
      for (const [index, url] of imageUrls.entries()) {
        const file = imageFiles[index];
        if (file) {
          const uploadData = new FormData();
          uploadData.set("file", file);
          const upload = await fetch("/api/admin/upload", {
            method: "POST",
            body: uploadData
          });
          const uploadResult = await upload.json();
          if (!upload.ok) throw new Error(uploadResult.error || "Image upload failed");
          finalImageUrls.push(uploadResult.url);
        } else if (url.trim()) {
          finalImageUrls.push(url.trim());
        }
      }

      const uniqueImageUrls = Array.from(new Set(finalImageUrls)).slice(0, maxFrameImages);

      const payload = {
        frame_code: String(formData.get("frame_code") || ""),
        name: String(formData.get("name") || ""),
        brand: String(formData.get("brand") || ""),
        category: category === "Other" ? customCategory.trim() : category,
        description: String(formData.get("description") || ""),
        price: Number(formData.get("price") || 0),
        quantity: Number(formData.get("quantity") || 0),
        image_url: uniqueImageUrls[0] || "",
        image_urls: uniqueImageUrls,
        is_active: formData.get("is_active") === "on"
      };

      const response = await fetch(frame ? `/api/admin/frames/${frame.id}` : "/api/admin/frames", {
        method: frame ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save frame");

      toast.success(frame ? "Frame updated" : "Frame added");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{frame ? "Edit frame" : "Add frame"}</DialogTitle>
          <DialogDescription>
            Keep the public catalog and stock count accurate.
          </DialogDescription>
        </DialogHeader>
        <form action={save} className="grid gap-4 md:grid-cols-2">
          <Field name="frame_code" label="Frame Code" defaultValue={frame?.frame_code} />
          <Field name="name" label="Name" defaultValue={frame?.name} />
          <Field name="brand" label="Brand" defaultValue={frame?.brand || ""} />
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category_choice" value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {category === "Other" ? (
              <Input
                id="custom_category"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="Enter category"
              />
            ) : null}
          </div>
          <Field name="price" label="Price" type="number" defaultValue={frame?.price} />
          <Field name="quantity" label="Quantity" type="number" defaultValue={frame?.quantity} />
          <div className="space-y-2 md:col-span-2">
            <Label>Image URLs</Label>
            <div className="grid gap-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="grid gap-2 rounded-md border border-border bg-optical-fog p-3 sm:grid-cols-[1fr_220px]">
                  <Input
                    name={`image_url_${index + 1}`}
                    value={url}
                    onChange={(event) => updateImageUrl(index, event.target.value)}
                    placeholder={index === 0 ? "Primary image URL" : `Image URL ${index + 1}`}
                  />
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 shrink-0 text-optical-muted" />
                    <Input
                      id={`image_file_${index + 1}`}
                      name={`image_file_${index + 1}`}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      aria-label={`Upload image ${index + 1}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              className="mt-2"
              defaultValue={frame?.description || ""}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input name="is_active" type="checkbox" defaultChecked={frame?.is_active ?? true} />
            Active
          </label>
          <Button disabled={loading || uploading} className="md:col-span-2">
            {loading ? "Saving..." : "Save Frame"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text"
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="mt-2"
      />
    </div>
  );
}
