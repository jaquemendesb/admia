import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { testWooConnection } from "@/lib/services/woo-sync.service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "integrations", "EXECUTE", async () => {
    try {
      const result = await testWooConnection(id)
      return NextResponse.json(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha na conexão"
      return NextResponse.json({ ok: false, error: message }, { status: 422 })
    }
  })
}
