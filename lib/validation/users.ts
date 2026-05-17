import { z } from "zod"

const ROLE_NAMES = ["SUPER_ADMIN", "ADMIN", "READONLY"] as const

export const createUserSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8, "Senha mínima: 8 caracteres"),
  role: z.enum(ROLE_NAMES),
  active: z.boolean().default(true),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(ROLE_NAMES).optional(),
  active: z.boolean().optional(),
})

export const ROLE_LABELS: Record<typeof ROLE_NAMES[number], string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  READONLY: "Somente leitura",
}

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
