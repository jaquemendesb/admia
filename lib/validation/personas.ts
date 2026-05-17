import { z } from "zod"

export const createPersonaSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  slug: z.string().min(1, "Slug obrigatório").max(100).regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífens"),
  description: z.string().max(500).optional().nullable(),
  system_prompt: z.string().min(1, "Prompt do sistema obrigatório"),
  tone: z.string().max(100).optional().nullable(),
  language: z.string().max(10).default("pt-BR"),
  active: z.boolean().default(true),
  is_default: z.boolean().default(false),
})

export const updatePersonaSchema = createPersonaSchema.partial()

export type CreatePersonaInput = z.infer<typeof createPersonaSchema>
export type UpdatePersonaInput = z.infer<typeof updatePersonaSchema>
