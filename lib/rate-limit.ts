export type RateLimitOptions = {
  windowMs: number;
  max: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type HeaderReader = {
  get(name: string): string | null;
};

export function createRateLimiter({ windowMs, max }: RateLimitOptions) {
  const records = new Map<string, RateLimitRecord>();

  return {
    check(key: string, now = Date.now()): RateLimitResult {
      const safeKey = key || "unknown";
      const record = records.get(safeKey);

      if (!record || now >= record.resetAt) {
        const resetAt = now + windowMs;
        records.set(safeKey, { count: 1, resetAt });
        return {
          allowed: true,
          remaining: Math.max(max - 1, 0),
          resetAt,
          retryAfterMs: 0
        };
      }

      if (record.count >= max) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: record.resetAt,
          retryAfterMs: Math.max(record.resetAt - now, 0)
        };
      }

      record.count += 1;
      return {
        allowed: true,
        remaining: Math.max(max - record.count, 0),
        resetAt: record.resetAt,
        retryAfterMs: 0
      };
    },
    clear() {
      records.clear();
    }
  };
}

export function getClientIp(headers: HeaderReader) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";

  return headers.get("x-real-ip")?.trim() || "unknown";
}
