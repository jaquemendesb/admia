import { z } from "zod"

export const createOfferSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(255),
  slug: z.string().min(1, "Slug obrigatório").max(255).regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífens"),
  description: z.string().max(1000).optional().nullable(),
  active: z.boolean().default(true),
  base_price: z.number().min(0).optional().nullable(),
  sale_price: z.number().min(0).optional().nullable(),
})

export const updateOfferSchema = createOfferSchema.partial()

export const addOfferItemSchema = z.object({
  catalog_item_id: z.string().uuid("Item do catálogo obrigatório"),
  quantity: z.number().int().min(1).default(1),
  role: z.string().max(50).optional().nullable(),
})

export type CreateOfferInput = z.infer<typeof createOfferSchema>
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>
export type AddOfferItemInput = z.infer<typeof addOfferItemSchema>
