import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updatePersonaSchema } from "@/lib/validation/personas"
import { getPersona, updatePersona, deletePersona } from "@/lib/services/personas.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "personas", "VIEW", async () => {
    const persona = await getPersona(id)
    if (!persona) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(persona)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "personas", "UPDATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = updatePersonaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const persona = await updatePersona(id, parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "persona", resourceId: id,
      action: "UPDATE", after: { name: persona.name },
      ipAddress, userAgent,
    })
    return NextResponse.json(persona)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "personas", "DELETE", async (req, { userId }) => {
    try {
      const existing = await getPersona(id)
      await deletePersona(id)
      const { ipAddress, userAgent } = extractRequestMeta(req)
      await createAuditLog({
        actorUserId: userId, resourceType: "persona", resourceId: id,
        action: "DELETE", before: { name: existing?.name },
        ipAddress, userAgent,
      })
      return new NextResponse(null, { status: 204 })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir"
      return NextResponse.json({ error: message }, { status: 409 })
    }
  })
}
