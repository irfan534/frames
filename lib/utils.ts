import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
}

const DEFAULT_SHOP_NAME = "Vision Thru Optics Velachery";
const DEFAULT_SHOP_PHONE = "+91 7305319309";
const DEFAULT_SHOP_ADDRESS =
  "Vision Thr'u Optics, 153 A, G2, Velachery Bypass Rd, near Spencer's Daily, Velachery, Chennai, Tamil Nadu 600042";

export function getShopConfig() {
  const name = process.env.NEXT_PUBLIC_SHOP_NAME || DEFAULT_SHOP_NAME;
  const phone =
    !process.env.NEXT_PUBLIC_SHOP_PHONE ||
    process.env.NEXT_PUBLIC_SHOP_PHONE === "+91 98765 43210"
      ? DEFAULT_SHOP_PHONE
      : process.env.NEXT_PUBLIC_SHOP_PHONE;
  const address =
    !process.env.NEXT_PUBLIC_SHOP_ADDRESS ||
    process.env.NEXT_PUBLIC_SHOP_ADDRESS === "Velachery, Chennai, Tamil Nadu"
      ? DEFAULT_SHOP_ADDRESS
      : process.env.NEXT_PUBLIC_SHOP_ADDRESS;
  const mapsQuery = encodeURIComponent(`${name}, ${address}`);

  return {
    name,
    phone,
    whatsappNumber: phone.replace(/\D/g, ""),
    address,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    googleMapsEmbedUrl: `https://www.google.com/maps?q=${mapsQuery}&output=embed`,
    qrImage:
      process.env.NEXT_PUBLIC_UPI_QR_IMAGE_URL ||
      "/images/upi-qr-placeholder.svg"
  };
}

export function imageFallback(seed: string) {
  const index = Math.abs(
    seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0)
  );

  const images = [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1556306535-38febf6782e7?auto=format&fit=crop&w=900&q=85"
  ];

  return images[index % images.length];
}

export function frameGalleryImages(frame: {
  frame_code: string;
  image_url?: string | null;
  image_urls?: string[] | null;
}) {
  const urls = [
    ...(Array.isArray(frame.image_urls) ? frame.image_urls : []),
    frame.image_url
  ].filter((url): url is string => Boolean(url));
  const uniqueUrls = Array.from(new Set(urls));

  return uniqueUrls.length > 0
    ? uniqueUrls.slice(0, 4)
    : [imageFallback(frame.frame_code)];
}

export function framePrimaryImage(frame: {
  frame_code: string;
  image_url?: string | null;
  image_urls?: string[] | null;
}) {
  return frameGalleryImages(frame)[0];
}

export function frameColors(frame: { colors?: string[] | null }) {
  return Array.isArray(frame.colors)
    ? frame.colors.filter((color) => /^#[0-9a-fA-F]{6}$/.test(color))
    : [];
}

export function stockLabel(quantity: number) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= 5) return "Low Stock";
  return "In Stock";
}
