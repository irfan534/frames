"use client";

import { usePathname } from "next/navigation";
import { getShopConfig } from "@/lib/utils";

const WHATSAPP_MESSAGE =
  "Hi!%20I%27d%20like%20to%20enquire%20about%20your%20frames.";

export function WhatsappChatButton() {
  const pathname = usePathname();
  const { whatsappNumber } = getShopConfig();
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${WHATSAPP_MESSAGE}`;

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 md:bottom-6 md:right-6 md:h-16 md:w-16"
      href={whatsappUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <svg
        aria-hidden="true"
        className="h-7 w-7 md:h-8 md:w-8"
        fill="currentColor"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.04 3C8.88 3 3.06 8.82 3.06 15.98c0 2.29.6 4.53 1.74 6.5L3 29l6.69-1.76a12.9 12.9 0 0 0 6.35 1.66h.01c7.16 0 12.98-5.82 12.98-12.98C29.02 8.82 23.2 3 16.04 3Zm0 23.72h-.01c-1.93 0-3.83-.52-5.49-1.5l-.39-.23-3.97 1.04 1.06-3.87-.25-.4a10.73 10.73 0 0 1-1.65-5.78c0-5.9 4.8-10.7 10.71-10.7 2.86 0 5.55 1.12 7.57 3.14a10.64 10.64 0 0 1 3.13 7.55c0 5.9-4.8 10.75-10.71 10.75Zm5.87-8.04c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.51-.16-.72.16-.21.32-.83 1.05-1.02 1.26-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.59-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.99-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.15 3.09 1.31 3.3.16.21 2.27 3.47 5.5 4.86.77.33 1.37.53 1.84.68.77.25 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
