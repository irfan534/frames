"use client";

import Image from "next/image";
import { type ChangeEventHandler, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Gift, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
const maxFrameColors = 6;
type OfferMode = "custom" | "combo" | "clear";

const offerLabels: Record<Exclude<OfferMode, "clear">, string> = {
  custom: "Special Offer",
  combo: "Combo Offer"
};

export function InventoryManager({ frames }: { frames: Frame[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("new");
  const [editing, setEditing] = useState<Frame | null>(null);
  const [open, setOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);

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
          <Button variant="accent" onClick={() => setOfferOpen(true)}>
            <Gift className="h-4 w-4" />
            Offer
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
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-optical-muted">{frame.frame_code}</p>
                        {frame.offer_label ? (
                          <Badge
                            variant={frame.offer_type === "combo" ? "warning" : "blue"}
                            className="px-2 py-0 text-[11px]"
                          >
                            {frame.offer_label}
                          </Badge>
                        ) : null}
                      </div>
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
      <OfferDialog
        frames={frames}
        open={offerOpen}
        onOpenChange={setOfferOpen}
        onSaved={() => {
          setOfferOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function OfferDialog({
  frames,
  open,
  onOpenChange,
  onSaved
}: {
  frames: Frame[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<OfferMode>("custom");
  const [label, setLabel] = useState(offerLabels.custom);
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeFrames = frames.filter((frame) => frame.is_active);
  const selectedFrames = activeFrames.filter((frame) => selectedIds.includes(frame.id));

  function toggleFrame(frameId: string) {
    setSelectedIds((current) =>
      current.includes(frameId)
        ? current.filter((id) => id !== frameId)
        : [...current, frameId]
    );
  }

  function updateMode(value: string) {
    const nextMode = value as OfferMode;
    setMode(nextMode);
    if (nextMode === "custom" || nextMode === "combo") {
      setLabel(offerLabels[nextMode]);
    }
  }

  async function saveOffer() {
    if (selectedFrames.length === 0) {
      toast.error("Select at least one product");
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        selectedFrames.map(async (frame) => {
          const payload = {
            frame_code: frame.frame_code,
            name: frame.name,
            brand: frame.brand || "",
            category: frame.category || "",
            description: frame.description || "",
            price: Number(frame.price),
            quantity: frame.quantity,
            image_url: frame.image_url || "",
            image_urls: frame.image_urls?.length
              ? frame.image_urls
              : frame.image_url
                ? [frame.image_url]
                : [],
            colors: frame.colors || [],
            offer_type: mode === "clear" ? null : mode,
            offer_label: mode === "clear" ? null : label.trim(),
            offer_description: mode === "clear" ? null : description.trim(),
            is_active: frame.is_active
          };

          const response = await fetch(`/api/admin/frames/${frame.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || `Could not update ${frame.name}`);
          }
        })
      );

      toast.success(
        mode === "clear"
          ? `Offer removed from ${selectedFrames.length} product${selectedFrames.length === 1 ? "" : "s"}`
          : `Offer applied to ${selectedFrames.length} product${selectedFrames.length === 1 ? "" : "s"}`
      );
      setSelectedIds([]);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Offer update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage offers</DialogTitle>
          <DialogDescription>
            Create a custom or combo offer tag for selected products.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="offer_type">Offer Type</Label>
              <Select value={mode} onValueChange={updateMode}>
                <SelectTrigger id="offer_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Offer</SelectItem>
                  <SelectItem value="combo">Combo Offer</SelectItem>
                  <SelectItem value="clear">Remove Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode !== "clear" ? (
              <Field
                key={mode}
                name="offer_label"
                label="Offer Tag"
                defaultValue={label}
                onChange={(event) => setLabel(event.target.value)}
              />
            ) : null}
          </div>

          {mode !== "clear" ? (
            <div>
              <Label htmlFor="offer_description">Offer Details</Label>
              <Textarea
                id="offer_description"
                className="mt-2"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Example: Buy one frame and get lens upgrade discount"
              />
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Products</Label>
              <span className="text-xs font-semibold text-optical-muted">
                {selectedFrames.length} selected
              </span>
            </div>
            <div className="max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border">
              {activeFrames.map((frame) => (
                <label
                  key={frame.id}
                  className="flex cursor-pointer items-center gap-3 p-3 text-sm hover:bg-optical-fog"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(frame.id)}
                    onChange={() => toggleFrame(frame.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{frame.name}</span>
                    <span className="block text-xs text-optical-muted">
                      {frame.frame_code}
                      {frame.offer_label ? ` · Current: ${frame.offer_label}` : ""}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button
            type="button"
            disabled={loading || selectedFrames.length === 0 || (mode !== "clear" && !label.trim())}
            onClick={saveOffer}
          >
            {loading ? "Saving..." : mode === "clear" ? "Remove Offer" : "Save Offer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
  const [colors, setColors] = useState(() => (frame?.colors || []).slice(0, maxFrameColors));
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

  function addColor() {
    setColors((current) =>
      current.length >= maxFrameColors ? current : [...current, "#000000"]
    );
  }

  function updateColor(index: number, value: string) {
    setColors((current) =>
      current.map((color, currentIndex) => (
        currentIndex === index ? value : color
      ))
    );
  }

  function removeColor(index: number) {
    setColors((current) => current.filter((_, currentIndex) => currentIndex !== index));
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
      const uniqueColors = Array.from(new Set(colors)).slice(0, maxFrameColors);

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
        colors: uniqueColors,
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
            <div className="flex items-center justify-between gap-3">
              <Label>Colors</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addColor}
                disabled={colors.length >= maxFrameColors}
              >
                <Plus className="h-4 w-4" />
                Add Color
              </Button>
            </div>
            {colors.length ? (
              <div className="flex flex-wrap gap-3">
                {colors.map((color, index) => (
                  <div key={`${color}-${index}`} className="flex items-center gap-2 rounded-md border border-border bg-optical-fog p-2">
                    <Input
                      aria-label={`Color ${index + 1}`}
                      className="h-9 w-12 cursor-pointer p-1"
                      type="color"
                      value={color}
                      onChange={(event) => updateColor(index, event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeColor(index)}
                      aria-label={`Remove color ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
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
  onChange,
  type = "text"
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  onChange?: ChangeEventHandler<HTMLInputElement>;
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
        onChange={onChange}
        className="mt-2"
      />
    </div>
  );
}
