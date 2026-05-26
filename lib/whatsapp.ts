import { formatCurrency, getShopConfig } from "@/lib/utils";
import { MAX_WHATSAPP_MESSAGE_CHARS, truncate } from "./whatsapp-format";

type WhatsAppOrder = {
  name: string;
  phone: string;
  fulfillmentMethod: "delivery" | "pickup";
  address: string;
  notes?: string | null;
  total: number;
  items: Array<{
    name?: string | null;
    frame_id?: string | null;
    qty?: number;
    cartQty?: number;
    price: number | string;
    frames?: { name?: string | null; frame_code?: string | null } | null;
  }>;
};

export function generateWhatsAppMessage(order: WhatsAppOrder) {
  const address = truncate(order.address, 200);
  const notes = truncate(order.notes ?? "", 200);
  const itemLines = order.items
    .map((item) => {
      const qty = item.cartQty || item.qty || 1;
      const itemName =
        item.name
          ? item.name
          : item.frames?.name || item.frames?.frame_code || item.frame_id;
      return `- ${itemName} x ${qty}: ${formatCurrency(Number(item.price) * qty)}`;
    })
    .join("\n");

  const message = [
    "Hi! I'd like to place an order.",
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `Fulfilment: ${order.fulfillmentMethod === "pickup" ? "Store Pickup" : "Delivery"}`,
    "Items:",
    itemLines,
    `Total: ${formatCurrency(order.total)}`,
    `${order.fulfillmentMethod === "pickup" ? "Pickup Location" : "Delivery Address"}: ${address}`,
    notes ? `Notes: ${notes}` : null,
    "I will scan the QR and send the payment screenshot here."
  ]
    .filter(Boolean)
    .join("\n");

  return truncate(message, MAX_WHATSAPP_MESSAGE_CHARS);
}

export function generateWhatsAppUrl(message: string) {
  const { whatsappNumber } = getShopConfig();
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
