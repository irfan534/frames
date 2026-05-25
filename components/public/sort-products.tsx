"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SortProducts() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <Select
      value={params.get("sort") || "popular"}
      onValueChange={(value) => {
        const next = new URLSearchParams(params.toString());
        next.set("sort", value);
        next.delete("page");
        router.push(`/products?${next.toString()}`);
      }}
    >
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popular">Popular</SelectItem>
        <SelectItem value="new">New Arrivals</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  );
}
