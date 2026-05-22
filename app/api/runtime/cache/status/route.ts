import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac/guard"
import { redis } from "@/lib/db/redis"

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    try {
      const raw = await redis.get("cache:refresh:last")
      if (!raw) return NextResponse.json({ status: "never_synced" })
      return NextResponse.json({ status: "ok", ...JSON.parse(raw) })
    } catch {
      return NextResponse.json({ status: "redis_unavailable" })
    }
  })
}
