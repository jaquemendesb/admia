import { NextRequest, NextResponse } from "next/server"
import { withRuntimeAuth } from "@/lib/rbac/runtime-guard"
import { getRuntimeCatalog } from "@/lib/services/runtime.service"

export async function GET(req: NextRequest) {
  return withRuntimeAuth(req, async () => {
    const url = new URL(req.url)
    const channel = url.searchParams.get("channel") ?? undefined
    const q = url.searchParams.get("q") ?? undefined
    return NextResponse.json(await getRuntimeCatalog(channel, q))
  })
}
