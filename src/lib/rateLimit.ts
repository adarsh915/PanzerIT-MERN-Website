/**
 * Lightweight in-memory IP-based rate limiter.
 * Zero dependencies - no Redis or DB required.
 *
 * Usage:
 *   const limiter = createRateLimiter("contact", { windowMs: 60_000, max: 5 })
 *   const { limited, retryAfterSecs } = limiter.check(ip)
 *   if (limited) return NextResponse.json({ message: "..." }, { status: 429 })
 */

type RateLimitEntry = {
  count: number
  windowStart: number
}

type RateLimiterOptions = {
  /** Duration of the time window in milliseconds */
  windowMs: number
  /** Max number of requests allowed within the window */
  max: number
}

export type RateLimitResult = {
  limited: boolean
  retryAfterSecs: number
}

// Store on `global` so the map persists across Next.js hot-reloads in dev
const globalStore = global as unknown as {
  _rateLimitMaps: Map<string, Map<string, RateLimitEntry>>
}
if (!globalStore._rateLimitMaps) {
  globalStore._rateLimitMaps = new Map()
}

export function createRateLimiter(name: string, options: RateLimiterOptions) {
  const { windowMs, max } = options

  if (!globalStore._rateLimitMaps.has(name)) {
    globalStore._rateLimitMaps.set(name, new Map())
  }

  const store = globalStore._rateLimitMaps.get(name)!

  return {
    check(ip: string): RateLimitResult {
      const now = Date.now()
      const entry = store.get(ip)

      if (!entry || now - entry.windowStart > windowMs) {
        // First request in window (or window expired) - start fresh
        store.set(ip, { count: 1, windowStart: now })
        return { limited: false, retryAfterSecs: 0 }
      }

      entry.count += 1
      store.set(ip, entry)

      if (entry.count > max) {
        const retryAfterSecs = Math.ceil((windowMs - (now - entry.windowStart)) / 1000)
        return { limited: true, retryAfterSecs }
      }

      return { limited: false, retryAfterSecs: 0 }
    },
  }
}
