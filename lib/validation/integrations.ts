import { z } from "zod"

export const createIntegrationSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  slug: z.string().min(1, "Slug obrigatório").max(100).regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífens"),
  integration_type: z.literal("WOOCOMMERCE"),
  base_url: z.string().url("URL base inválida"),
  consumer_key: z.string().min(1, "Consumer Key obrigatória"),
  consumer_secret: z.string().min(1, "Consumer Secret obrigatório"),
  active: z.boolean().default(true),
  sync_enabled: z.boolean().default(false),
  default_channel_id: z.string().uuid().optional().nullable(),
})

export const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  base_url: z.string().url().optional(),
  consumer_key: z.string().min(1).optional(),
  consumer_secret: z.string().min(1).optional(),
  active: z.boolean().optional(),
  sync_enabled: z.boolean().optional(),
  default_channel_id: z.string().uuid().optional().nullable(),
})

export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>
export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>
