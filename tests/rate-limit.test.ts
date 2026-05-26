import assert from "node:assert/strict";
import { createRateLimiter, getClientIp } from "../lib/rate-limit";
import { test } from "./test-helpers";

test("rate limiter blocks requests after the configured max until reset", () => {
  const limiter = createRateLimiter({ windowMs: 1_000, max: 2 });

  assert.equal(limiter.check("client-a", 0).allowed, true);
  assert.equal(limiter.check("client-a", 100).allowed, true);

  const blocked = limiter.check("client-a", 200);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterMs, 800);

  assert.equal(limiter.check("client-a", 1_000).allowed, true);
});

test("rate limiter keeps separate counters per client", () => {
  const limiter = createRateLimiter({ windowMs: 1_000, max: 1 });

  assert.equal(limiter.check("client-a", 0).allowed, true);
  assert.equal(limiter.check("client-b", 0).allowed, true);
  assert.equal(limiter.check("client-a", 1).allowed, false);
});

test("client ip prefers the first forwarded address", () => {
  const headers = new Map([
    ["x-forwarded-for", "203.0.113.10, 198.51.100.2"],
    ["x-real-ip", "198.51.100.3"]
  ]);

  assert.equal(
    getClientIp({
      get(name: string) {
        return headers.get(name) || null;
      }
    }),
    "203.0.113.10"
  );
});

test("rate limiter returns correct remaining count on each request", () => {
  const limiter = createRateLimiter({ windowMs: 1_000, max: 3 });

  assert.equal(limiter.check("client-a", 0).remaining, 2);
  assert.equal(limiter.check("client-a", 100).remaining, 1);
  assert.equal(limiter.check("client-a", 200).remaining, 0);

  const blocked = limiter.check("client-a", 300);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});

test("getClientIp falls back to x-real-ip when x-forwarded-for is absent", () => {
  const headers = new Map([["x-real-ip", "10.0.0.1"]]);

  assert.equal(
    getClientIp({
      get(name: string) {
        return headers.get(name) || null;
      }
    }),
    "10.0.0.1"
  );
});

test("getClientIp returns unknown when no ip headers are present", () => {
  const headers = new Map<string, string>();

  assert.equal(
    getClientIp({
      get(name: string) {
        return headers.get(name) || null;
      }
    }),
    "unknown"
  );
});
