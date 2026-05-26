import assert from "node:assert/strict";
import { originsMatch, withProtocol } from "../lib/csrf-core";
import { test } from "./test-helpers";

test("originsMatch returns true for matching origins", () => {
  assert.equal(originsMatch("https://frames.example.com/checkout", "frames.example.com"), true);
});

test("originsMatch returns false for different origins", () => {
  assert.equal(originsMatch("https://frames.example.com", "https://admin.example.com"), false);
});

test("originsMatch returns false for empty allowed string", () => {
  assert.equal(originsMatch("https://frames.example.com", ""), false);
});

test("originsMatch returns false for malformed source URL", () => {
  assert.equal(originsMatch("not a url", "frames.example.com"), false);
});

test("withProtocol prepends https to bare domain", () => {
  assert.equal(withProtocol("frames.example.com"), "https://frames.example.com");
});

test("withProtocol does not double-prefix an https URL", () => {
  assert.equal(withProtocol("https://frames.example.com"), "https://frames.example.com");
});
