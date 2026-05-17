import { NextRequest, NextResponse } from "next/server"
import { withRuntimeAuth } from "@/lib/rbac/runtime-guard"
import { getRuntimeConfig } from "@/lib/services/runtime.service"

export async function GET(req: NextRequest) {
  return withRuntimeAuth(req, async () => {
    return NextResponse.json(await getRuntimeConfig())
  })
}
