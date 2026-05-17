import { NextRequest, NextResponse } from "next/server"
import { withRuntimeAuth } from "@/lib/rbac/runtime-guard"
import { getRuntimeCatalog } from "@/lib/services/runtime.service"

export async function GET(req: NextRequest) {
  return withRuntimeAuth(req, async () => {
    const channel = new URL(req.url).searchParams.get("channel") ?? undefined
    return NextResponse.json(await getRuntimeCatalog(channel))
  })
}
