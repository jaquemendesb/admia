import { prisma } from "@/lib/db/client"
import type { CreateAgentInput, UpdateAgentInput } from "@/lib/validation/agents"
import { triggerCacheRefresh } from "@/lib/services/cache-refresh.service"

export async function listAgents() {
  return prisma.aiAgent.findMany({
    where: { deleted_at: null },
    orderBy: [{ agent_role: "asc" }, { name: "asc" }],
  })
}

export async function getAgent(id: string) {
  return prisma.aiAgent.findFirst({ where: { id, deleted_at: null } })
}

export async function createAgent(data: CreateAgentInput) {
  const result = await prisma.aiAgent.create({ data })
  void triggerCacheRefresh()
  return result
}

export async function updateAgent(id: string, data: UpdateAgentInput) {
  const result = await prisma.aiAgent.update({ where: { id }, data })
  void triggerCacheRefresh()
  return result
}

export async function deleteAgent(id: string) {
  const result = await prisma.aiAgent.update({
    where: { id },
    data: { deleted_at: new Date() },
  })
  void triggerCacheRefresh()
  return result
}
