import { NextRequest, NextResponse } from "next/server"

type RuntimeHandler = (req: NextRequest) => Promise<NextResponse>

/**
 * Guards runtime API endpoints with a shared Bearer token.
 * Set RUNTIME_API_KEY in environment. n8n must send:
 *   Authorization: Bearer <RUNTIME_API_KEY>
 */
export async function withRuntimeAuth(
  req: NextRequest,
  handler: RuntimeHandler
): Promise<NextResponse> {
  const runtimeKey = process.env.RUNTIME_API_KEY
  if (!runtimeKey) {
    return NextResponse.json({ error: "Runtime API not configured" }, { status: 503 })
  }

  const authHeader = req.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token || token !== runtimeKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return handler(req)
}
