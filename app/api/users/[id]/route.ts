import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateUserSchema } from "@/lib/validation/users"
import { getUser, updateUser, deleteUser } from "@/lib/services/users.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "users", "UPDATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const user = await updateUser(id, parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "user", resourceId: id,
      action: "UPDATE", after: { email: user.email, active: user.active, role_changed: !!parsed.data.role },
      ipAddress, userAgent,
    })
    return NextResponse.json({ id: user.id, name: user.name, email: user.email })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "users", "DELETE", async (req, { userId }) => {
    if (id === userId) {
      return NextResponse.json({ error: "Não é possível excluir o próprio usuário" }, { status: 409 })
    }
    const existing = await getUser(id)
    if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    await deleteUser(id)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "user", resourceId: id,
      action: "DELETE", before: { email: existing.email },
      ipAddress, userAgent,
    })
    return new NextResponse(null, { status: 204 })
  })
}
