export type Frame = {
  id: string;
  frame_code: string;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  image_urls?: string[] | null;
  colors?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type CartItem = Frame & {
  cartQty: number;
};

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  notes: string | null;
  total_amount: number;
  payment_status: "pending" | "payment_claimed" | "paid" | "cancelled";
  order_status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  frame_id: string;
  qty: number;
  price: number;
  frames?: Pick<Frame, "id" | "name" | "brand" | "frame_code" | "image_url"> | null;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type Sale = {
  id: string;
  frame_id: string;
  qty: number;
  amount: number;
  payment_method: string;
  sold_at: string;
  frames?: Pick<Frame, "name" | "brand" | "frame_code"> | null;
};
