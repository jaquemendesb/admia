import { prisma } from "@/lib/db/client"
import type { CreateKnowledgeInput, UpdateKnowledgeInput } from "@/lib/validation/knowledge"

export async function listKnowledge(channelId?: string | null) {
  return prisma.knowledgeBase.findMany({
    where: {
      deleted_at: null,
      ...(channelId ? { business_channel_id: channelId } : {}),
    },
    include: { business_channel: { select: { id: true, name: true } } },
    orderBy: { title: "asc" },
  })
}

export async function getKnowledgeEntry(id: string) {
  return prisma.knowledgeBase.findFirst({
    where: { id, deleted_at: null },
    include: { business_channel: { select: { id: true, name: true } } },
  })
}

export async function createKnowledgeEntry(data: CreateKnowledgeInput) {
  return prisma.knowledgeBase.create({ data })
}

export async function updateKnowledgeEntry(id: string, data: UpdateKnowledgeInput) {
  return prisma.knowledgeBase.update({ where: { id }, data })
}

export async function deleteKnowledgeEntry(id: string) {
  return prisma.knowledgeBase.update({
    where: { id },
    data: { deleted_at: new Date() },
  })
}
