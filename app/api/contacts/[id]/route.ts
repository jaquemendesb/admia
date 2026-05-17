import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateContactSchema } from "@/lib/validation/contacts"
import { getContact, updateContact, deleteContact } from "@/lib/services/contacts.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "contacts", "VIEW", async () => {
    const contact = await getContact(id)
    if (!contact) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(contact)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "contacts", "UPDATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = updateContactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const existing = await getContact(id)
    if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    const contact = await updateContact(id, parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "contact", resourceId: id,
      action: "UPDATE",
      before: { name: existing.name, active: existing.active },
      after: { name: contact.name, active: contact.active },
      ipAddress, userAgent,
    })
    return NextResponse.json(contact)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "contacts", "DELETE", async (req, { userId }) => {
    const existing = await getContact(id)
    if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    await deleteContact(id)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "contact", resourceId: id,
      action: "DELETE", before: { name: existing.name, phone: existing.phone },
      ipAddress, userAgent,
    })
    return new NextResponse(null, { status: 204 })
  })
}
