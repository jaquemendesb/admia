import { NextRequest, NextResponse } from "next/server"
import { withRuntimeAuth } from "@/lib/rbac/runtime-guard"
import { redis } from "@/lib/db/redis"

// Called by n8n after completing a cache refresh.
// Stores the result in Redis so the UI can display sync status.
export async function POST(req: NextRequest) {
  return withRuntimeAuth(req, async () => {
    const body = await req.json()
    const status = {
      success: body.success ?? false,
      resources: body.resources ?? [],
      error: body.error ?? null,
      updated_at: new Date().toISOString(),
    }
    await redis.set("cache:refresh:last", JSON.stringify(status), "EX", 60 * 60 * 24 * 7)
    return NextResponse.json({ ok: true })
  })
}
