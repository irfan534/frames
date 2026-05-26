import assert from "node:assert/strict";
import { MAX_WHATSAPP_MESSAGE_CHARS, truncate } from "../lib/whatsapp-format";
import { test } from "./test-helpers";

test("truncate returns the string unchanged when within limit", () => {
  assert.equal(truncate("hello", 10), "hello");
});

test("truncate cuts and appends ellipsis when over limit", () => {
  assert.equal(truncate("hello world", 6), "hello…");
});

test("truncate result is exactly max chars long", () => {
  assert.equal(truncate("hello world", 6).length, 6);
});

test("truncate handles a string of exactly max length", () => {
  assert.equal(truncate("hello", 5), "hello");
});

test("MAX_WHATSAPP_MESSAGE_CHARS is 1500", () => {
  assert.equal(MAX_WHATSAPP_MESSAGE_CHARS, 1500);
});
