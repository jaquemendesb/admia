import { prisma } from "@/lib/db/client"
import { encrypt, decrypt } from "@/lib/crypto/encrypt"
import type { CreateIntegrationInput, UpdateIntegrationInput } from "@/lib/validation/integrations"

function buildCredentials(consumerKey: string, consumerSecret: string): string {
  return encrypt(JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }))
}

export async function listIntegrations() {
  return prisma.integration.findMany({
    where: { deleted_at: null },
    include: { default_channel: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  })
}

export async function getIntegration(id: string) {
  return prisma.integration.findFirst({
    where: { id, deleted_at: null },
    include: { default_channel: { select: { id: true, name: true } } },
  })
}

export function decryptCredentials(encrypted: string): { consumer_key: string; consumer_secret: string } {
  return JSON.parse(decrypt(encrypted))
}

export async function createIntegration(data: CreateIntegrationInput) {
  const credentials_encrypted = buildCredentials(data.consumer_key, data.consumer_secret)
  return prisma.integration.create({
    data: {
      name: data.name,
      slug: data.slug,
      integration_type: data.integration_type,
      base_url: data.base_url,
      credentials_encrypted,
      active: data.active,
      sync_enabled: data.sync_enabled,
      default_channel_id: data.default_channel_id ?? null,
      metadata: data.webhook_secret ? { webhook_secret: data.webhook_secret } : undefined,
    },
  })
}

export async function updateIntegration(id: string, data: UpdateIntegrationInput) {
  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.base_url !== undefined) updateData.base_url = data.base_url
  if (data.active !== undefined) updateData.active = data.active
  if (data.sync_enabled !== undefined) updateData.sync_enabled = data.sync_enabled
  if (data.default_channel_id !== undefined) updateData.default_channel_id = data.default_channel_id

  if (data.consumer_key || data.consumer_secret) {
    const existing = await prisma.integration.findFirst({ where: { id, deleted_at: null } })
    if (!existing) throw new Error("Integration not found")
    const current = decryptCredentials(existing.credentials_encrypted)
    updateData.credentials_encrypted = buildCredentials(
      data.consumer_key ?? current.consumer_key,
      data.consumer_secret ?? current.consumer_secret
    )
  }

  if (data.webhook_secret !== undefined) {
    const existing = await prisma.integration.findFirst({ where: { id, deleted_at: null }, select: { metadata: true } })
    const currentMeta = (existing?.metadata as Record<string, unknown> | null) ?? {}
    updateData.metadata = data.webhook_secret
      ? { ...currentMeta, webhook_secret: data.webhook_secret }
      : { ...currentMeta, webhook_secret: null }
  }

  return prisma.integration.update({ where: { id }, data: updateData })
}

export async function deleteIntegration(id: string) {
  return prisma.integration.update({
    where: { id },
    data: { deleted_at: new Date() },
  })
}
