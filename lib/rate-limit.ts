import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const LIFETIME_LIMIT = 5;

// Per-user lifetime limit: 5 AI calls total (1 full run across all 5 modules)
export async function checkLifetimeLimit(userId: string): Promise<{ success: boolean; remaining: number }> {
  const key = `orbit:lifetime:${userId}`;
  const count = await redis.incr(key);
  if (count > LIFETIME_LIMIT) {
    return { success: false, remaining: 0 };
  }
  return { success: true, remaining: LIFETIME_LIMIT - count };
}
