export type CheckoutLineItem = {
  frameId: string;
  qty: number;
};

export type CheckoutFrame = {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
};

export type BuiltOrderItem<TFrame extends CheckoutFrame> = {
  frame: TFrame;
  qty: number;
  price: number;
};

export type BuildOrderItemsResult<TFrame extends CheckoutFrame> =
  | {
      ok: true;
      orderItems: BuiltOrderItem<TFrame>[];
      total: number;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export function parseFinalOrderTotal(value: unknown):
  | { ok: true; total: number }
  | { ok: false; error: string } {
  const total =
    typeof value === "string" && value.trim() === "" ? NaN : Number(value);

  if (!Number.isFinite(total) || total <= 0) {
    return { ok: false, error: "Enter a valid final price." };
  }

  return { ok: true, total };
}

export function buildOrderItems<TFrame extends CheckoutFrame>(
  items: CheckoutLineItem[],
  frames: TFrame[]
): BuildOrderItemsResult<TFrame> {
  const frameMap = new Map(frames.map((frame) => [frame.id, frame]));
  const requestedQty = new Map<string, number>();

  for (const item of items) {
    requestedQty.set(item.frameId, (requestedQty.get(item.frameId) || 0) + item.qty);
  }

  const orderItems: BuiltOrderItem<TFrame>[] = [];

  for (const [frameId, qty] of requestedQty) {
    const frame = frameMap.get(frameId);
    if (!frame) {
      return {
        ok: false,
        status: 400,
        error: "One or more products are unavailable."
      };
    }

    if (qty > frame.quantity) {
      return {
        ok: false,
        status: 400,
        error: `${frame.name} has only ${frame.quantity} in stock.`
      };
    }

    orderItems.push({
      frame,
      qty,
      price: Number(frame.price)
    });
  }

  return {
    ok: true,
    orderItems,
    total: orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  };
}
