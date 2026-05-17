import { z } from "zod"

export const createChannelSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  slug: z.string().min(1, "Slug obrigatório").max(100).regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífens"),
  description: z.string().max(500).optional().nullable(),
  active: z.boolean().default(true),
  priority: z.number().int().min(0).default(0),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
})

export const updateChannelSchema = createChannelSchema.partial()

export type CreateChannelInput = z.infer<typeof createChannelSchema>
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>
