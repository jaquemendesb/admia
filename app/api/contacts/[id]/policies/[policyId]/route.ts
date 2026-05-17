import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateContactPolicySchema } from "@/lib/validation/contacts"
import { updateContactPolicy, deleteContactPolicy } from "@/lib/services/contacts.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; policyId: string }> }
) {
  const { id, policyId } = await params
  return withPermission(req, "contact_policies", "UPDATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = updateContactPolicySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const policy = await updateContactPolicy(policyId, parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "contact_policy", resourceId: policyId,
      action: "UPDATE", after: { contact_id: id, ...parsed.data },
      ipAddress, userAgent,
    })
    return NextResponse.json(policy)
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; policyId: string }> }
) {
  const { id, policyId } = await params
  return withPermission(req, "contact_policies", "DELETE", async (req, { userId }) => {
    await deleteContactPolicy(policyId)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "contact_policy", resourceId: policyId,
      action: "DELETE", before: { contact_id: id },
      ipAddress, userAgent,
    })
    return new NextResponse(null, { status: 204 })
  })
}
