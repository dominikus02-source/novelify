import { NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval?: number;
  maxRequests?: number;
}

export function rateLimit(opts: RateLimitOptions = {}) {
  const { interval = 60000, maxRequests = 10 } = opts;

  const tokenCache = new LRUCache({
    max: 500,
    ttl: interval,
  });

  return {
    check: (request: Request): NextResponse | null => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? request.headers.get('x-real-ip')
        ?? 'anonymous';

      const current = (tokenCache.get(ip) as number) || 0;

      if (current >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil(interval / 1000)) } }
        );
      }

      tokenCache.set(ip, current + 1);
      return null;
    },
  };
}

const CHECK_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

interface CheckRateLimitEntry {
  count: number;
  resetAt: number;
}

const checkStore = new Map<string, CheckRateLimitEntry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of checkStore) {
    if (now >= entry.resetAt) {
      checkStore.delete(key);
    }
  }
}

setInterval(cleanup, 60_000);

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = checkStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    checkStore.set(ip, { count: 1, resetAt: now + CHECK_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}
