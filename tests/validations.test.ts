import assert from "node:assert/strict";
import { checkoutSchema, contactSchema, frameSchema, imageUploadSchema } from "../lib/validations";
import { test } from "./test-helpers";

const frameId = "11111111-1111-4111-8111-111111111111";

test("checkoutSchema accepts a valid delivery order", () => {
  const parsed = checkoutSchema.safeParse({
    customer_name: "Anita Kumar",
    phone: "+91 98765 43210",
    fulfillment_method: "delivery",
    address: "12 Market Road, Near Metro Station",
    pincode: "600042",
    city: "Chennai",
    state: "Tamil Nadu",
    notes: "Please call before delivery",
    items: [{ frameId, qty: 1 }]
  });

  assert.equal(parsed.success, true);
});

test("checkoutSchema rejects delivery order with missing address", () => {
  const parsed = checkoutSchema.safeParse({
    customer_name: "Anita Kumar",
    phone: "+91 98765 43210",
    fulfillment_method: "delivery",
    address: "",
    pincode: "600042",
    city: "Chennai",
    state: "Tamil Nadu",
    items: [{ frameId, qty: 1 }]
  });

  assert.equal(parsed.success, false);
});

test("checkoutSchema rejects invalid pincode", () => {
  const parsed = checkoutSchema.safeParse({
    customer_name: "Anita Kumar",
    phone: "+91 98765 43210",
    fulfillment_method: "delivery",
    address: "12 Market Road, Near Metro Station",
    pincode: "ABC",
    city: "Chennai",
    state: "Tamil Nadu",
    items: [{ frameId, qty: 1 }]
  });

  assert.equal(parsed.success, false);
});

test("checkoutSchema accepts a valid pickup order without address fields", () => {
  const parsed = checkoutSchema.safeParse({
    customer_name: "Anita Kumar",
    phone: "+91 98765 43210",
    fulfillment_method: "pickup",
    address: "",
    pincode: "",
    city: "",
    state: "",
    items: [{ frameId, qty: 1 }]
  });

  assert.equal(parsed.success, true);
});

test("checkoutSchema rejects items array longer than max qty per item", () => {
  const parsed = checkoutSchema.safeParse({
    customer_name: "Anita Kumar",
    phone: "+91 98765 43210",
    fulfillment_method: "pickup",
    address: "",
    pincode: "",
    city: "",
    state: "",
    items: [{ frameId, qty: 21 }]
  });

  assert.equal(parsed.success, false);
});

test("contactSchema rejects short message", () => {
  const parsed = contactSchema.safeParse({
    name: "Anita Kumar",
    email: "anita@example.com",
    message: "Too short"
  });

  assert.equal(parsed.success, false);
});

test("frameSchema rejects negative price", () => {
  const parsed = frameSchema.safeParse({
    frame_code: "FR-101",
    name: "Classic Round",
    price: -1,
    quantity: 2,
    image_url: ""
  });

  assert.equal(parsed.success, false);
});

test("imageUploadSchema rejects files over 5MB", () => {
  const parsed = imageUploadSchema.safeParse({
    fileName: "frame.webp",
    mimeType: "image/webp",
    size: 5 * 1024 * 1024 + 1
  });

  assert.equal(parsed.success, false);
});
