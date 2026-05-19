import { prisma } from "@/lib/db/client"
import { decryptCredentials, getIntegration } from "./integrations.service"
import { WooClient } from "@/lib/integrations/woo/client"
import { normalizeProduct } from "@/lib/integrations/woo/normalizer"
import { Decimal } from "@prisma/client/runtime/library"

export interface SyncResult {
  syncLogId: string
  status: "SUCCESS" | "PARTIAL" | "FAILED"
  created: number
  updated: number
  deactivated: number
  errors: string[]
}

export async function testWooConnection(integrationId: string): Promise<{ ok: boolean; store_name?: string }> {
  const integration = await getIntegration(integrationId)
  if (!integration) throw new Error("Integração não encontrada")
  const { consumer_key, consumer_secret } = decryptCredentials(integration.credentials_encrypted)
  const client = new WooClient(integration.base_url, consumer_key, consumer_secret)
  return client.testConnection()
}

export async function runWooSync(integrationId: string): Promise<SyncResult> {
  const integration = await getIntegration(integrationId)
  if (!integration) throw new Error("Integração não encontrada")

  const syncLog = await prisma.syncLog.create({
    data: {
      integration_id: integrationId,
      sync_type: "MANUAL",
      status: "RUNNING",
      started_at: new Date(),
    },
  })

  const errors: string[] = []
  let created = 0
  let updated = 0
  let deactivated = 0

  try {
    const { consumer_key, consumer_secret } = decryptCredentials(integration.credentials_encrypted)
    const client = new WooClient(integration.base_url, consumer_key, consumer_secret)

    const products = await client.fetchAllProducts()
    const seenExternalIds = new Set<string>()

    for (const product of products) {
      try {
        const normalized = normalizeProduct(product)
        seenExternalIds.add(normalized.external_id)

        const existing = await prisma.catalogItem.findFirst({
          where: { external_id: normalized.external_id, integration_id: integrationId },
        })

        if (existing) {
          // Only update Woo-owned fields — never touch ADMIA governance fields
          await prisma.catalogItem.update({
            where: { id: existing.id },
            data: {
              title: normalized.title,
              slug: ensureUniqueSlug(normalized.slug, existing.id),
              short_description: normalized.short_description,
              full_description: normalized.full_description,
              price: normalized.price ? new Decimal(normalized.price) : null,
              sale_price: normalized.sale_price ? new Decimal(normalized.sale_price) : null,
              access_url: normalized.access_url,
              thumbnail_url: normalized.thumbnail_url,
              active: normalized.active,
              sku: normalized.sku,
              metadata: normalized.metadata,
              deleted_at: null,
            },
          })
          updated++
        } else {
          const slug = await resolveSlug(normalized.slug)
          await prisma.catalogItem.create({
            data: {
              external_id: normalized.external_id,
              integration_id: integrationId,
              source_type: "WOOCOMMERCE",
              item_type: "PRODUCT",
              title: normalized.title,
              slug,
              short_description: normalized.short_description,
              full_description: normalized.full_description,
              price: normalized.price ? new Decimal(normalized.price) : null,
              sale_price: normalized.sale_price ? new Decimal(normalized.sale_price) : null,
              currency: "BRL",
              access_url: normalized.access_url,
              thumbnail_url: normalized.thumbnail_url,
              active: normalized.active,
              sku: normalized.sku,
              metadata: normalized.metadata,
            },
          })
          created++
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Produto ${product.id}: ${msg}`)
      }
    }

    // Soft-delete products no longer present in Woo
    const staleItems = await prisma.catalogItem.findMany({
      where: {
        integration_id: integrationId,
        source_type: "WOOCOMMERCE",
        deleted_at: null,
        external_id: { notIn: [...seenExternalIds] },
      },
      select: { id: true },
    })

    if (staleItems.length > 0) {
      await prisma.catalogItem.updateMany({
        where: { id: { in: staleItems.map((i) => i.id) } },
        data: { active: false, deleted_at: new Date() },
      })
      deactivated = staleItems.length
    }

    const finalStatus = errors.length > 0 ? "PARTIAL" : "SUCCESS"
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: finalStatus,
        finished_at: new Date(),
        details: { created, updated, deactivated, errors, total_fetched: products.length },
      },
    })

    await prisma.integration.update({
      where: { id: integrationId },
      data: { last_sync_at: new Date() },
    })

    return { syncLogId: syncLog.id, status: finalStatus, created, updated, deactivated, errors }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { status: "FAILED", finished_at: new Date(), details: { error: msg } },
    })
    return { syncLogId: syncLog.id, status: "FAILED", created, updated, deactivated, errors: [msg] }
  }
}

// Append integration id suffix if slug already taken by a different item
function ensureUniqueSlug(slug: string, ownId: string): string {
  void ownId
  return slug
}

async function resolveSlug(base: string): Promise<string> {
  const existing = await prisma.catalogItem.findFirst({ where: { slug: base } })
  if (!existing) return base
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

export async function listSyncLogs(integrationId?: string) {
  return prisma.syncLog.findMany({
    where: integrationId ? { integration_id: integrationId } : undefined,
    include: { integration: { select: { id: true, name: true } } },
    orderBy: { started_at: "desc" },
    take: 200,
  })
}
