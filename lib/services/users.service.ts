import { prisma } from "@/lib/db/client"
import bcrypt from "bcryptjs"
import type { CreateUserInput, UpdateUserInput } from "@/lib/validation/users"
import type { RoleName } from "@/types/rbac"

export async function listUsers() {
  return prisma.user.findMany({
    where: { deleted_at: null },
    select: {
      id: true, name: true, email: true, active: true,
      last_login_at: true, created_at: true, updated_at: true,
      user_roles: { include: { role: { select: { name: true } } } },
    },
    orderBy: { name: "asc" },
  })
}

export async function getUser(id: string) {
  return prisma.user.findFirst({
    where: { id, deleted_at: null },
    select: {
      id: true, name: true, email: true, active: true,
      last_login_at: true, created_at: true,
      user_roles: { include: { role: { select: { name: true } } } },
    },
  })
}

export async function createUser(data: CreateUserInput) {
  const password_hash = await bcrypt.hash(data.password, 12)

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: data.name, email: data.email, password_hash, active: data.active },
    })

    const role = await tx.role.findFirst({ where: { name: data.role as RoleName } })
    if (!role) throw new Error(`Role ${data.role} não encontrado`)

    await tx.userRole.create({ data: { user_id: user.id, role_id: role.id } })

    return user
  })
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.active !== undefined) updateData.active = data.active
    if (data.password) updateData.password_hash = await bcrypt.hash(data.password, 12)

    const user = await tx.user.update({ where: { id }, data: updateData })

    if (data.role) {
      const role = await tx.role.findFirst({ where: { name: data.role as RoleName } })
      if (!role) throw new Error(`Role ${data.role} não encontrado`)
      await tx.userRole.deleteMany({ where: { user_id: id } })
      await tx.userRole.create({ data: { user_id: id, role_id: role.id } })
    }

    return user
  })
}

export async function deleteUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deleted_at: new Date(), active: false },
  })
}
