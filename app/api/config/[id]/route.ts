import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateConfigSchema } from "@/lib/validation/automation-config"
import { getConfig, updateConfig, deleteConfig } from "@/lib/services/automation-config.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "automation_config", "UPDATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = updateConfigSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const existing = await getConfig(id)
    const config = await updateConfig(id, parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "automation_config", resourceId: id,
      action: "UPDATE",
      before: { key: existing?.config_key, value: existing?.config_value },
      after: { key: config.config_key, value: config.config_value },
      ipAddress, userAgent,
    })
    return NextResponse.json(config)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "automation_config", "DELETE", async (req, { userId }) => {
    const existing = await getConfig(id)
    if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    await deleteConfig(id)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "automation_config", resourceId: id,
      action: "DELETE", before: { key: existing.config_key },
      ipAddress, userAgent,
    })
    return new NextResponse(null, { status: 204 })
  })
}
