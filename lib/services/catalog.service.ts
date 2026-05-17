import { prisma } from "@/lib/db/client"
import type { CreateCatalogItemInput, UpdateCatalogItemInput } from "@/lib/validation/catalog"

export interface CatalogListOptions {
  search?: string
  source_type?: string
  item_type?: string
  active?: boolean
}

export async function listCatalogItems(opts: CatalogListOptions = {}) {
  return prisma.catalogItem.findMany({
    where: {
      deleted_at: null,
      ...(opts.active !== undefined && { active: opts.active }),
      ...(opts.source_type && { source_type: opts.source_type as never }),
      ...(opts.item_type && { item_type: opts.item_type as never }),
      ...(opts.search && {
        OR: [
          { title: { contains: opts.search, mode: "insensitive" } },
          { sku: { contains: opts.search, mode: "insensitive" } },
          { slug: { contains: opts.search, mode: "insensitive" } },
        ],
      }),
    },
    include: { integration: { select: { name: true } } },
    orderBy: { title: "asc" },
  })
}

export async function getCatalogItem(id: string) {
  return prisma.catalogItem.findFirst({
    where: { id, deleted_at: null },
    include: {
      integration: { select: { id: true, name: true } },
      channel_assignments: {
        where: { deleted_at: null },
        include: { business_channel: { select: { id: true, name: true } } },
      },
    },
  })
}

export async function createCatalogItem(data: CreateCatalogItemInput) {
  return prisma.catalogItem.create({
    data: {
      ...data,
      price: data.price != null ? data.price : undefined,
      sale_price: data.sale_price != null ? data.sale_price : undefined,
      access_url: data.access_url || null,
      thumbnail_url: data.thumbnail_url || null,
    },
  })
}

export async function updateCatalogItem(id: string, data: UpdateCatalogItemInput) {
  return prisma.catalogItem.update({
    where: { id },
    data: {
      ...data,
      price: data.price != null ? data.price : undefined,
      sale_price: data.sale_price != null ? data.sale_price : undefined,
      access_url: data.access_url || null,
      thumbnail_url: data.thumbnail_url || null,
    },
  })
}

export async function deleteCatalogItem(id: string) {
  return prisma.catalogItem.update({
    where: { id },
    data: { deleted_at: new Date() },
  })
}
