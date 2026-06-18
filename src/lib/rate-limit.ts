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
