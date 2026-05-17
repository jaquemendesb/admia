import { prisma } from "@/lib/db/client"
import type { CreateAgentInput, UpdateAgentInput } from "@/lib/validation/agents"

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
  return prisma.aiAgent.create({ data })
}

export async function updateAgent(id: string, data: UpdateAgentInput) {
  return prisma.aiAgent.update({ where: { id }, data })
}

export async function deleteAgent(id: string) {
  return prisma.aiAgent.update({
    where: { id },
    data: { deleted_at: new Date() },
  })
}
