import assert from "node:assert/strict";
import { buildOrderItems } from "../lib/orders";
import { test } from "./test-helpers";

const frames = [
  {
    id: "frame-1",
    name: "AeroFlex Rectangle",
    price: "1499",
    quantity: 2
  },
  {
    id: "frame-2",
    name: "SunEdge Polarized",
    price: 1999,
    quantity: 5
  }
];

test("buildOrderItems aggregates duplicate frame ids before checking stock", () => {
  const result = buildOrderItems(
    [
      { frameId: "frame-1", qty: 1 },
      { frameId: "frame-1", qty: 2 }
    ],
    frames
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 400);
    assert.match(result.error, /only 2 in stock/);
  }
});

test("buildOrderItems returns server-priced order items and total", () => {
  const result = buildOrderItems(
    [
      { frameId: "frame-1", qty: 2 },
      { frameId: "frame-2", qty: 1 }
    ],
    frames
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.total, 4997);
    assert.deepEqual(
      result.orderItems.map((item) => ({
        id: item.frame.id,
        qty: item.qty,
        price: item.price
      })),
      [
        { id: "frame-1", qty: 2, price: 1499 },
        { id: "frame-2", qty: 1, price: 1999 }
      ]
    );
  }
});

test("buildOrderItems rejects unavailable frames", () => {
  const result = buildOrderItems([{ frameId: "missing", qty: 1 }], frames);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, "One or more products are unavailable.");
  }
});
