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
