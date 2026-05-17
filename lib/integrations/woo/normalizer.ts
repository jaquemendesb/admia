import type { Prisma } from "@prisma/client"
import type { WooProduct } from "./client"

export interface NormalizedProduct {
  external_id: string
  sku: string | null
  title: string
  slug: string
  short_description: string | null
  full_description: string | null
  price: string | null
  sale_price: string | null
  access_url: string | null
  thumbnail_url: string | null
  active: boolean
  metadata: Prisma.InputJsonValue
}

export function normalizeProduct(product: WooProduct): NormalizedProduct {
  return {
    external_id: String(product.id),
    sku: product.sku || null,
    title: product.name,
    slug: product.slug,
    short_description: stripHtml(product.short_description) || null,
    full_description: stripHtml(product.description) || null,
    price: product.regular_price || product.price || null,
    sale_price: product.sale_price || null,
    access_url: product.permalink || null,
    thumbnail_url: product.images?.[0]?.src ?? null,
    active: product.status === "publish",
    metadata: {
      woo_status: product.status,
      categories: product.categories,
      tags: product.tags,
      date_modified: product.date_modified,
    },
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim()
}
