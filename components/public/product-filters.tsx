"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { brands, categories, frameShapes, genders } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  const filterContent = (
    <div className="space-y-5">
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="font-display text-2xl font-bold">Filters</h2>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          update("search", String(formData.get("search") || ""));
        }}
      >
        <Label>Search</Label>
        <div className="mt-2 flex gap-2">
          <Input
            name="search"
            type="search"
            placeholder="Frame name"
            defaultValue={searchParams.get("search") || ""}
          />
          <Button type="submit" size="icon" aria-label="Search products">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <FilterSelect
        label="Category"
        value={searchParams.get("category") || "all"
        }
        values={categories}
        onValueChange={(value) => update("category", value)}
      />
      <FilterSelect
        label="Brand"
        value={searchParams.get("brand") || "all"}
        values={brands}
        onValueChange={(value) => update("brand", value)}
      />
      <FilterSelect
        label="Frame Shape"
        value={searchParams.get("shape") || "all"}
        values={frameShapes}
        onValueChange={(value) => update("shape", value)}
      />
      <FilterSelect
        label="Gender"
        value={searchParams.get("gender") || "all"}
        values={genders}
        onValueChange={(value) => update("gender", value)}
      />

      <div>
        <Label>Price up to</Label>
        <input
          type="range"
          min="500"
          max="5000"
          step="100"
          defaultValue={searchParams.get("max") || "5000"}
          className="mt-3 w-full accent-primary"
          onChange={(event) => update("max", event.currentTarget.value)}
        />
        <div className="mt-1 flex justify-between text-xs text-optical-muted">
          <span>Rs. 500</span>
          <span>Rs. 5000</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push("/products")}
      >
        Clear filters
      </Button>
    </div>
  );

  return (
    <>
      <Button
        variant="outline"
        className="mb-4 w-full justify-between lg:hidden"
        onClick={() => setOpen(true)}
      >
        Filters <SlidersHorizontal className="h-4 w-4" />
      </Button>
      <aside className="sticky top-24 hidden h-max rounded-lg border border-border bg-white p-5 lg:block">
        <h2 className="font-display text-2xl font-bold">Filters</h2>
        <div className="mt-5">{filterContent}</div>
      </aside>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 max-h-[86vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            {filterContent}
          </div>
        </div>
      ) : null}
    </>
  );
}

function FilterSelect({
  label,
  value,
  values,
  onValueChange
}: {
  label: string;
  value: string;
  values: string[];
  onValueChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="mt-2">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {values.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
