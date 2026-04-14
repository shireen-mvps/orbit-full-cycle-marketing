import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const LIFETIME_LIMIT = 5;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = `orbit:lifetime:${userId}`;
  const used = (await redis.get<number>(key)) ?? 0;
  const remaining = Math.max(0, LIFETIME_LIMIT - used);

  return NextResponse.json({ remaining, total: LIFETIME_LIMIT });
}
