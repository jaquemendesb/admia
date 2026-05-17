import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createIntegrationSchema } from "@/lib/validation/integrations"
import { listIntegrations, createIntegration } from "@/lib/services/integrations.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest) {
  return withPermission(req, "integrations", "VIEW", async () => {
    const integrations = await listIntegrations()
    const safe = integrations.map(({ credentials_encrypted: _, ...rest }) => rest)
    return NextResponse.json(safe)
  })
}

export async function POST(req: NextRequest) {
  return withPermission(req, "integrations", "CREATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = createIntegrationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const integration = await createIntegration(parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId,
      resourceType: "integration",
      resourceId: integration.id,
      action: "CREATE",
      after: { name: integration.name, type: integration.integration_type },
      ipAddress,
      userAgent,
    })
    const { credentials_encrypted: _, ...safe } = integration
    return NextResponse.json(safe, { status: 201 })
  })
}
