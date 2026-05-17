import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createConfigSchema } from "@/lib/validation/automation-config"
import { listConfigs, createConfig } from "@/lib/services/automation-config.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest) {
  return withPermission(req, "automation_config", "VIEW", async () => {
    return NextResponse.json(await listConfigs())
  })
}

export async function POST(req: NextRequest) {
  return withPermission(req, "automation_config", "CREATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = createConfigSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const config = await createConfig(parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "automation_config", resourceId: config.id,
      action: "CREATE", after: { key: config.config_key, value: config.config_value },
      ipAddress, userAgent,
    })
    return NextResponse.json(config, { status: 201 })
  })
}
