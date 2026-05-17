import { z } from "zod"

const sourceTypes = ["WOOCOMMERCE", "MANUAL", "INTERNAL", "BLOG", "URL"] as const
const itemTypes = ["PRODUCT", "COURSE", "LESSON", "ARTICLE", "DOWNLOAD", "BONUS", "MEMBERSHIP", "RESOURCE"] as const

export const createCatalogItemSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(255),
  slug: z.string().min(1, "Slug obrigatório").max(255).regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífens"),
  source_type: z.enum(sourceTypes, { required_error: "Tipo de origem obrigatório" }),
  item_type: z.enum(itemTypes, { required_error: "Tipo de item obrigatório" }),
  integration_id: z.string().uuid().optional().nullable(),
  external_id: z.string().max(255).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  short_description: z.string().max(500).optional().nullable(),
  full_description: z.string().optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  sale_price: z.number().min(0).optional().nullable(),
  currency: z.string().max(3).default("BRL"),
  access_url: z.string().url().optional().nullable().or(z.literal("")),
  thumbnail_url: z.string().url().optional().nullable().or(z.literal("")),
  active: z.boolean().default(true),
})

export const updateCatalogItemSchema = createCatalogItemSchema.partial()

export type CreateCatalogItemInput = z.infer<typeof createCatalogItemSchema>
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>
