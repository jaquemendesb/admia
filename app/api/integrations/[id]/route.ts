import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateIntegrationSchema } from "@/lib/validation/integrations"
import { getIntegration, updateIntegration, deleteIntegration } from "@/lib/services/integrations.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "integrations", "VIEW", async () => {
    const integration = await getIntegration(id)
    if (!integration) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    const { credentials_encrypted: _, ...safe } = integration
    return NextResponse.json(safe)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "integrations", "UPDATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = updateIntegrationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const credentialChanged = !!(parsed.data.consumer_key || parsed.data.consumer_secret)
    const integration = await updateIntegration(id, parsed.data)
    if (credentialChanged) {
      const { ipAddress, userAgent } = extractRequestMeta(req)
      await createAuditLog({
        actorUserId: userId,
        resourceType: "integration",
        resourceId: id,
        action: "CREDENTIAL_UPDATE",
        after: { name: integration.name },
        ipAddress,
        userAgent,
      })
    }
    const { credentials_encrypted: _, ...safe } = integration
    return NextResponse.json(safe)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "integrations", "DELETE", async (req, { userId }) => {
    const existing = await getIntegration(id)
    if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    await deleteIntegration(id)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId,
      resourceType: "integration",
      resourceId: id,
      action: "DELETE",
      before: { name: existing.name, type: existing.integration_type },
      ipAddress,
      userAgent,
    })
    return new NextResponse(null, { status: 204 })
  })
}
