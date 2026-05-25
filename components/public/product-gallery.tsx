"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName
}: {
  images: string[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] || images[0];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-optical-fog">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          priority
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setSelectedIndex(index)}
            aria-label={`View ${productName} image ${index + 1}`}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-md border bg-optical-fog transition",
              selectedIndex === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/70"
            )}
          >
            <Image
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              fill
              sizes="150px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
