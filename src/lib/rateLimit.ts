import { LRUCache } from "lru-cache";

type Bucket = { count: number; resetAt: number };

const globalForRate = globalThis as unknown as {
  rateBuckets?: LRUCache<string, Bucket>;
};

const buckets =
  globalForRate.rateBuckets ??
  new LRUCache<string, Bucket>({
    max: 5000,
    ttl: 1000 * 60 * 30,
  });

if (!globalForRate.rateBuckets) globalForRate.rateBuckets = buckets;

export function rateLimitOrThrow(params: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const b = buckets.get(params.key);
  if (!b || b.resetAt <= now) {
    buckets.set(params.key, { count: 1, resetAt: now + params.windowMs });
    return;
  }
  if (b.count >= params.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
    const err = new Error("Rate limited");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).statusCode = 429;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).retryAfterSeconds = retryAfterSeconds;
    throw err;
  }
  b.count += 1;
  buckets.set(params.key, b);
}

