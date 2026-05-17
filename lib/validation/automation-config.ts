import { z } from "zod"

const VALUE_TYPES = ["STRING", "INTEGER", "BOOLEAN", "JSON"] as const

export const createConfigSchema = z.object({
  config_key: z.string().min(1, "Chave obrigatória").max(100).regex(/^[a-z0-9_]+$/, "Chave: apenas letras minúsculas, números e underscores"),
  config_value: z.string().min(1, "Valor obrigatório"),
  value_type: z.enum(VALUE_TYPES).default("STRING"),
})

export const updateConfigSchema = z.object({
  config_value: z.string().min(1, "Valor obrigatório"),
  value_type: z.enum(VALUE_TYPES).optional(),
})

export const VALUE_TYPE_LABELS: Record<typeof VALUE_TYPES[number], string> = {
  STRING: "Texto", INTEGER: "Inteiro", BOOLEAN: "Booleano", JSON: "JSON",
}

export const VALUE_TYPES_ARRAY = VALUE_TYPES

export type CreateConfigInput = z.infer<typeof createConfigSchema>
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>
