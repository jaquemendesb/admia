import { z } from "zod"

const AGENT_ROLES = ["ROUTER", "CONVERSATION", "SUPPORT", "MEMORY", "POLICY"] as const

export const createAgentSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  slug: z.string().min(1, "Slug obrigatório").max(100).regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífens"),
  agent_role: z.enum(AGENT_ROLES, { required_error: "Papel do agente obrigatório" }),
  model_alias: z.string().min(1, "Alias do modelo obrigatório").max(100),
  prompt_template: z.string().min(1, "Template de prompt obrigatório"),
  active: z.boolean().default(true),
})

export const updateAgentSchema = createAgentSchema.partial()

export const AGENT_ROLE_LABELS: Record<typeof AGENT_ROLES[number], string> = {
  ROUTER: "Roteador",
  CONVERSATION: "Conversação",
  SUPPORT: "Suporte",
  MEMORY: "Memória",
  POLICY: "Política",
}

export const AGENT_ROLES_ARRAY = AGENT_ROLES

export type CreateAgentInput = z.infer<typeof createAgentSchema>
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>
