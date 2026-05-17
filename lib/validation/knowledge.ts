import { z } from "zod"

const KNOWLEDGE_TYPES = ["FAQ", "POLICY", "SALES_SCRIPT", "PRODUCT_INFO", "OBJECTION", "OTHER"] as const

export const createKnowledgeSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(255),
  slug: z.string().min(1, "Slug obrigatório").max(255).regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífens"),
  content: z.string().min(1, "Conteúdo obrigatório"),
  knowledge_type: z.enum(KNOWLEDGE_TYPES, { required_error: "Tipo obrigatório" }),
  active: z.boolean().default(true),
  business_channel_id: z.string().uuid().optional().nullable(),
})

export const updateKnowledgeSchema = createKnowledgeSchema.partial()

export const KNOWLEDGE_TYPE_LABELS: Record<typeof KNOWLEDGE_TYPES[number], string> = {
  FAQ: "FAQ",
  POLICY: "Política",
  SALES_SCRIPT: "Script de Vendas",
  PRODUCT_INFO: "Info de Produto",
  OBJECTION: "Objeção",
  OTHER: "Outro",
}

export const KNOWLEDGE_TYPES_ARRAY = KNOWLEDGE_TYPES

export type CreateKnowledgeInput = z.infer<typeof createKnowledgeSchema>
export type UpdateKnowledgeInput = z.infer<typeof updateKnowledgeSchema>
