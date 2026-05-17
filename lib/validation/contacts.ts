import { z } from "zod"

export const updateContactSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  active: z.boolean().optional(),
})

const POLICY_TYPES = ["TEST", "WHITELIST", "BLACKLIST"] as const
const POLICY_SOURCES = ["MANUAL", "AI", "SYSTEM"] as const

export const createContactPolicySchema = z.object({
  policy_type: z.enum(POLICY_TYPES, { required_error: "Tipo de política obrigatório" }),
  source_type: z.enum(POLICY_SOURCES).default("MANUAL"),
  notes: z.string().max(1000).optional().nullable(),
  active: z.boolean().default(true),
})

export const updateContactPolicySchema = createContactPolicySchema.partial()

export const updateContactMemorySchema = z.object({
  memory_value: z.string().min(1, "Valor obrigatório"),
  confidence: z.number().min(0).max(1).optional().nullable(),
})

export const POLICY_TYPE_LABELS: Record<typeof POLICY_TYPES[number], string> = {
  TEST: "Teste",
  WHITELIST: "Whitelist",
  BLACKLIST: "Blacklist",
}

export const POLICY_SOURCE_LABELS: Record<typeof POLICY_SOURCES[number], string> = {
  MANUAL: "Manual",
  AI: "IA",
  SYSTEM: "Sistema",
}

export const POLICY_TYPES_ARRAY = POLICY_TYPES

export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type CreateContactPolicyInput = z.infer<typeof createContactPolicySchema>
export type UpdateContactPolicyInput = z.infer<typeof updateContactPolicySchema>
export type UpdateContactMemoryInput = z.infer<typeof updateContactMemorySchema>
