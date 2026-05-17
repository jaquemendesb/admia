import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createPersonaSchema } from "@/lib/validation/personas"
import { listPersonas, createPersona } from "@/lib/services/personas.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest) {
  return withPermission(req, "personas", "VIEW", async () => {
    return NextResponse.json(await listPersonas())
  })
}

export async function POST(req: NextRequest) {
  return withPermission(req, "personas", "CREATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = createPersonaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const persona = await createPersona(parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "persona", resourceId: persona.id,
      action: "CREATE", after: { name: persona.name, is_default: persona.is_default },
      ipAddress, userAgent,
    })
    return NextResponse.json(persona, { status: 201 })
  })
}
