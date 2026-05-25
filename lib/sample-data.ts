import type { Frame, OrderWithItems, Sale } from "@/lib/types";

export const sampleFrames: Frame[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    frame_code: "CV-EG-101",
    name: "AeroFlex Rectangle",
    brand: "ClearView",
    category: "Eyeglasses",
    description:
      "Lightweight acetate frame with stainless steel hinges and a balanced everyday fit.",
    price: 1499,
    quantity: 18,
    image_url:
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=900&q=85",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    frame_code: "CV-SG-202",
    name: "SunEdge Polarized",
    brand: "Vista",
    category: "Sunglasses",
    description:
      "UV-protected polarized sunglasses with a confident square profile.",
    price: 1999,
    quantity: 9,
    image_url:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    frame_code: "CV-KD-303",
    name: "Little Scholar Blue",
    brand: "Aura",
    category: "Kids Frames",
    description:
      "Durable kids frame with soft nose pads, flexible temples, and cheerful color.",
    price: 999,
    quantity: 4,
    image_url:
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=900&q=85",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    frame_code: "CV-CG-404",
    name: "ScreenEase Round",
    brand: "Nova",
    category: "Computer Glasses",
    description:
      "Blue-light filtering frame designed for long screen hours and clear focus.",
    price: 1299,
    quantity: 2,
    image_url:
      "https://images.unsplash.com/photo-1556306535-38febf6782e7?auto=format&fit=crop&w=900&q=85",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    frame_code: "CV-EG-505",
    name: "MetroLine Titanium",
    brand: "Rayline",
    category: "Eyeglasses",
    description:
      "Slim titanium-inspired profile with a premium matte finish for daily wear.",
    price: 2499,
    quantity: 13,
    image_url:
      "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?auto=format&fit=crop&w=900&q=85",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    frame_code: "CV-CL-606",
    name: "HydraSoft Monthly Lens",
    brand: "Urban Optic",
    category: "Contact Lenses",
    description:
      "Comfortable monthly contact lenses with breathable hydration support.",
    price: 1199,
    quantity: 24,
    image_url:
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=900&q=85",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const sampleOrders: OrderWithItems[] = [];
export const sampleSales: Sale[] = [];
