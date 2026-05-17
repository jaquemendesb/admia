import { NextRequest, NextResponse } from "next/server"
import { withRuntimeAuth } from "@/lib/rbac/runtime-guard"
import { getRuntimePersona } from "@/lib/services/runtime.service"

export async function GET(req: NextRequest) {
  return withRuntimeAuth(req, async () => {
    const slug = new URL(req.url).searchParams.get("slug") ?? undefined
    const persona = await getRuntimePersona(slug)
    if (!persona) return NextResponse.json({ error: "No active persona" }, { status: 404 })
    return NextResponse.json(persona)
  })
}
