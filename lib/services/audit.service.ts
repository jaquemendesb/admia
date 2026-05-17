import { prisma } from "@/lib/db/client"

export interface AuditListOptions {
  resource_type?: string
  action?: string
  actor_email?: string
  page?: number
  pageSize?: number
}

export async function listAuditLogs(opts: AuditListOptions = {}) {
  const { resource_type, action, actor_email, page = 1, pageSize = 50 } = opts

  let actorUserIds: string[] | undefined
  if (actor_email) {
    const users = await prisma.user.findMany({
      where: { email: { contains: actor_email, mode: "insensitive" } },
      select: { id: true },
    })
    actorUserIds = users.map((u) => u.id)
  }

  const where = {
    ...(resource_type && { resource_type }),
    ...(action && { action }),
    ...(actorUserIds && { actor_user_id: { in: actorUserIds } }),
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total, page, pageSize }
}
