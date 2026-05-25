import { z } from "zod";

export const cartItemSchema = z.object({
  frameId: z.string().uuid(),
  qty: z.number().int().min(1).max(20)
});

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Name is required").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,18}$/, "Enter a valid phone number"),
  fulfillment_method: z.enum(["delivery", "pickup"]),
  address: z.string().trim().max(300),
  pincode: z.string().trim(),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  items: z.array(cartItemSchema).min(1, "Cart is empty")
}).superRefine((value, context) => {
  if (value.fulfillment_method !== "delivery") return;

  if (value.address.length < 10) {
    context.addIssue({
      code: "custom",
      path: ["address"],
      message: "Address is required"
    });
  }
  if (!/^[0-9]{6}$/.test(value.pincode)) {
    context.addIssue({
      code: "custom",
      path: ["pincode"],
      message: "Enter a valid pincode"
    });
  }
  if (value.city.length < 2) {
    context.addIssue({
      code: "custom",
      path: ["city"],
      message: "City is required"
    });
  }
  if (value.state.length < 2) {
    context.addIssue({
      code: "custom",
      path: ["state"],
      message: "State is required"
    });
  }
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(800)
});

export const frameSchema = z.object({
  frame_code: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(120),
  brand: z.string().trim().max(80).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(1200).optional().or(z.literal("")),
  price: z.coerce.number().positive("Price must be positive"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  image_url: z.string().trim().url().optional().or(z.literal("")),
  image_urls: z.array(z.string().trim().url()).max(4, "Use up to 4 images per frame").optional().default([]),
  colors: z.array(z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid color")).max(6, "Use up to 6 colors per frame").optional().default([]),
  is_active: z.coerce.boolean().default(true)
});

export const orderStatusSchema = z.object({
  id: z.string().uuid()
});

export const imageUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  size: z.number().max(5 * 1024 * 1024)
});
