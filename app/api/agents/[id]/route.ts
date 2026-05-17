import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateAgentSchema } from "@/lib/validation/agents"
import { getAgent, updateAgent, deleteAgent } from "@/lib/services/agents.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "agents", "VIEW", async () => {
    const agent = await getAgent(id)
    if (!agent) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(agent)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "agents", "UPDATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = updateAgentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const agent = await updateAgent(id, parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "ai_agent", resourceId: id,
      action: "UPDATE", after: { name: agent.name, model_alias: agent.model_alias },
      ipAddress, userAgent,
    })
    return NextResponse.json(agent)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "agents", "DELETE", async (req, { userId }) => {
    const existing = await getAgent(id)
    if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    await deleteAgent(id)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "ai_agent", resourceId: id,
      action: "DELETE", before: { name: existing.name, role: existing.agent_role },
      ipAddress, userAgent,
    })
    return new NextResponse(null, { status: 204 })
  })
}
