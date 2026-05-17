import { prisma } from "@/lib/db/client"
import type { CreatePersonaInput, UpdatePersonaInput } from "@/lib/validation/personas"

export async function listPersonas() {
  return prisma.persona.findMany({
    where: { deleted_at: null },
    orderBy: [{ is_default: "desc" }, { name: "asc" }],
  })
}

export async function getPersona(id: string) {
  return prisma.persona.findFirst({ where: { id, deleted_at: null } })
}

export async function createPersona(data: CreatePersonaInput) {
  return prisma.$transaction(async (tx) => {
    if (data.is_default) {
      await tx.persona.updateMany({
        where: { deleted_at: null, is_default: true },
        data: { is_default: false },
      })
    }
    return tx.persona.create({ data })
  })
}

export async function updatePersona(id: string, data: UpdatePersonaInput) {
  return prisma.$transaction(async (tx) => {
    if (data.is_default) {
      await tx.persona.updateMany({
        where: { deleted_at: null, is_default: true, NOT: { id } },
        data: { is_default: false },
      })
    }
    return tx.persona.update({ where: { id }, data })
  })
}

export async function deletePersona(id: string) {
  const persona = await prisma.persona.findFirst({ where: { id, deleted_at: null } })
  if (persona?.is_default) {
    throw new Error("Não é possível excluir a persona padrão.")
  }
  return prisma.persona.update({
    where: { id },
    data: { deleted_at: new Date() },
  })
}
