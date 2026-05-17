import { NextRequest, NextResponse } from "next/server"
import { withRuntimeAuth } from "@/lib/rbac/runtime-guard"
import { checkContactPolicy } from "@/lib/services/runtime.service"

export async function GET(req: NextRequest) {
  return withRuntimeAuth(req, async () => {
    const phone = new URL(req.url).searchParams.get("phone")
    if (!phone) return NextResponse.json({ error: "phone param required" }, { status: 400 })
    return NextResponse.json(await checkContactPolicy(phone))
  })
}
