import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateContactMemorySchema } from "@/lib/validation/contacts"
import { updateContactMemory, deleteContactMemory } from "@/lib/services/contacts.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memoryId: string }> }
) {
  const { id, memoryId } = await params
  return withPermission(req, "contact_memory", "UPDATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = updateContactMemorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const memory = await updateContactMemory(memoryId, parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "contact_memory", resourceId: memoryId,
      action: "UPDATE", after: { contact_id: id, memory_key: memory.memory_key },
      ipAddress, userAgent,
    })
    return NextResponse.json(memory)
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memoryId: string }> }
) {
  const { id, memoryId } = await params
  return withPermission(req, "contact_memory", "DELETE", async (req, { userId }) => {
    await deleteContactMemory(memoryId)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "contact_memory", resourceId: memoryId,
      action: "DELETE", before: { contact_id: id },
      ipAddress, userAgent,
    })
    return new NextResponse(null, { status: 204 })
  })
}
