import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createContactPolicySchema } from "@/lib/validation/contacts"
import { listContactPolicies, createContactPolicy } from "@/lib/services/contacts.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "contact_policies", "VIEW", async () => {
    return NextResponse.json(await listContactPolicies(id))
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "contact_policies", "CREATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = createContactPolicySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const policy = await createContactPolicy(id, parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "contact_policy", resourceId: policy.id,
      action: "CREATE", after: { contact_id: id, policy_type: policy.policy_type, source_type: policy.source_type },
      ipAddress, userAgent,
    })
    return NextResponse.json(policy, { status: 201 })
  })
}
