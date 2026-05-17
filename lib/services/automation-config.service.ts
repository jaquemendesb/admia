import { prisma } from "@/lib/db/client"
import type { CreateConfigInput, UpdateConfigInput } from "@/lib/validation/automation-config"

export async function listConfigs() {
  return prisma.automationConfig.findMany({ orderBy: { config_key: "asc" } })
}

export async function getConfig(id: string) {
  return prisma.automationConfig.findFirst({ where: { id } })
}

export async function getConfigByKey(key: string) {
  return prisma.automationConfig.findFirst({ where: { config_key: key } })
}

export async function createConfig(data: CreateConfigInput) {
  return prisma.automationConfig.create({ data })
}

export async function updateConfig(id: string, data: UpdateConfigInput) {
  return prisma.automationConfig.update({ where: { id }, data })
}

export async function deleteConfig(id: string) {
  return prisma.automationConfig.delete({ where: { id } })
}
