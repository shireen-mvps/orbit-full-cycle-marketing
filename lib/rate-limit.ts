import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Per-user: 6 AI calls/day (1 gen + 1 regen per module -- demo mode)
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(6, "1 d"),
  prefix: "orbit:ai",
});

// Global circuit breaker: 100 calls/day across all users
export const globalRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 d"),
  prefix: "orbit:global",
});
