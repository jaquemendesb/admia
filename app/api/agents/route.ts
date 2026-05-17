import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createAgentSchema } from "@/lib/validation/agents"
import { listAgents, createAgent } from "@/lib/services/agents.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest) {
  return withPermission(req, "agents", "VIEW", async () => {
    return NextResponse.json(await listAgents())
  })
}

export async function POST(req: NextRequest) {
  return withPermission(req, "agents", "CREATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = createAgentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const agent = await createAgent(parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "ai_agent", resourceId: agent.id,
      action: "CREATE", after: { name: agent.name, role: agent.agent_role, model_alias: agent.model_alias },
      ipAddress, userAgent,
    })
    return NextResponse.json(agent, { status: 201 })
  })
}
