import { prisma } from "@/lib/db/client"

interface AuditOptions {
  actorUserId?: string | null
  resourceType: string
  resourceId?: string | null
  action: string
  before?: unknown
  after?: unknown
  ipAddress?: string | null
  userAgent?: string | null
}

export async function createAuditLog(opts: AuditOptions): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actor_user_id: opts.actorUserId ?? null,
      resource_type: opts.resourceType,
      resource_id: opts.resourceId ?? null,
      action: opts.action,
      before_json: opts.before !== undefined ? (opts.before as object) : undefined,
      after_json: opts.after !== undefined ? (opts.after as object) : undefined,
      ip_address: opts.ipAddress ?? null,
      user_agent: opts.userAgent ?? null,
    },
  })
}

export function extractRequestMeta(request: Request): {
  ipAddress: string | null
  userAgent: string | null
} {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: request.headers.get("user-agent") ?? null,
  }
}
