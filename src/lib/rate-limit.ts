
export interface RateLimitResult {
  /** Whether the request is allowed. */
  ok: boolean;
  /** Seconds the caller should wait before retrying. */
  retryAfter: number;
  /** Number of requests left in the current window. */
  remaining: number;
}

interface Bucket {
  count: number;
  /** Epoch ms when the current window ends. */
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Removes expired buckets so the map cannot grow without bound. */
function prune(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Counts a request against `key` and reports whether it is allowed.
 *
 * @param key      Bucket identity, e.g. `${ip}:${formSlug}`.
 * @param limit    Requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0, remaining: limit - 1 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { ok: false, retryAfter, remaining: 0 };
  }

  return { ok: true, retryAfter: 0, remaining: limit - bucket.count };
}

/** Clears every bucket. Only used by tests. */
export function resetRateLimits() {
  buckets.clear();
}
