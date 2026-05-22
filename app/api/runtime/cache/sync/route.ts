import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac/guard"
import { triggerCacheRefresh } from "@/lib/services/cache-refresh.service"

export async function POST(req: NextRequest) {
  return withAuth(req, async () => {
    await triggerCacheRefresh()
    return NextResponse.json({ ok: true })
  })
}
