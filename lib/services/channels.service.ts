import { prisma } from "@/lib/db/client"
import type { CreateChannelInput, UpdateChannelInput } from "@/lib/validation/channels"

export async function listChannels() {
  return prisma.businessChannel.findMany({
    where: { deleted_at: null },
    orderBy: [{ priority: "asc" }, { name: "asc" }],
  })
}

export async function getChannel(id: string) {
  return prisma.businessChannel.findFirst({
    where: { id, deleted_at: null },
  })
}

export async function createChannel(data: CreateChannelInput) {
  return prisma.businessChannel.create({ data })
}

export async function updateChannel(id: string, data: UpdateChannelInput) {
  return prisma.businessChannel.update({ where: { id }, data })
}

export async function deleteChannel(id: string) {
  return prisma.businessChannel.update({
    where: { id },
    data: { deleted_at: new Date() },
  })
}
