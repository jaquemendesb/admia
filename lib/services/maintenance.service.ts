import { prisma } from "@/lib/db/client"
import type { Prisma } from "@prisma/client"
import { runWooSync } from "./woo-sync.service"
import type { JobType } from "@/lib/validation/maintenance"

export type { JobType } from "@/lib/validation/maintenance"
export { JOB_TYPES, ADMIN_SAFE_JOBS, JOB_IS_DESTRUCTIVE, JOB_TYPE_LABELS, JOB_TYPE_DESCRIPTIONS } from "@/lib/validation/maintenance"

export async function listMaintenanceJobs() {
  return prisma.maintenanceJob.findMany({
    include: { created_by: { select: { id: true, name: true, email: true } } },
    orderBy: { created_at: "desc" },
    take: 100,
  })
}

export async function executeMaintenanceJob(jobType: JobType, userId: string): Promise<string> {
  const job = await prisma.maintenanceJob.create({
    data: {
      job_type: jobType,
      status: "RUNNING",
      started_at: new Date(),
      created_by_user_id: userId,
    },
  })

  try {
    const result = await runJob(jobType)
    await prisma.maintenanceJob.update({
      where: { id: job.id },
      data: { status: "SUCCESS", finished_at: new Date(), payload: result },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await prisma.maintenanceJob.update({
      where: { id: job.id },
      data: { status: "FAILED", finished_at: new Date(), payload: { error: message } },
    })
  }

  return job.id
}

async function runJob(jobType: JobType): Promise<Prisma.InputJsonValue> {
  switch (jobType) {
    case "SYNC_ALL_INTEGRATIONS": {
      const integrations = await prisma.integration.findMany({
        where: { deleted_at: null, active: true, sync_enabled: true },
        select: { id: true, name: true },
      })
      const results = []
      for (const integration of integrations) {
        try {
          const r = await runWooSync(integration.id)
          results.push({ id: integration.id, name: integration.name, ...r })
        } catch (err) {
          results.push({ id: integration.id, name: integration.name, status: "FAILED", error: String(err) })
        }
      }
      return { integrations_processed: integrations.length, results }
    }

    case "PURGE_MESSAGES": {
      const config = await prisma.automationConfig.findFirst({ where: { config_key: "retention_days_messages" } })
      const days = parseInt(config?.config_value ?? "90", 10)
      const cutoff = new Date(Date.now() - days * 86_400_000)
      const { count } = await prisma.message.deleteMany({ where: { created_at: { lt: cutoff } } })
      return { deleted_count: count, cutoff_date: cutoff.toISOString(), retention_days: days }
    }

    case "PURGE_SOFT_DELETED_CONTACTS": {
      const cutoff = new Date(Date.now() - 30 * 86_400_000)
      const contacts = await prisma.contact.findMany({
        where: { deleted_at: { not: null, lt: cutoff } },
        select: { id: true },
      })
      let deleted = 0
      for (const c of contacts) {
        await prisma.contactMemory.deleteMany({ where: { contact_id: c.id } })
        await prisma.contactPolicy.deleteMany({ where: { contact_id: c.id } })
        await prisma.policyLog.deleteMany({ where: { contact_id: c.id } })
        await prisma.message.deleteMany({ where: { contact_id: c.id } })
        await prisma.conversation.deleteMany({ where: { contact_id: c.id } })
        await prisma.contact.delete({ where: { id: c.id } })
        deleted++
      }
      return { deleted_count: deleted, cutoff_date: cutoff.toISOString() }
    }

    case "PURGE_SYNC_LOGS": {
      const config = await prisma.automationConfig.findFirst({ where: { config_key: "retention_days_sync_logs" } })
      const days = parseInt(config?.config_value ?? "90", 10)
      const cutoff = new Date(Date.now() - days * 86_400_000)
      const { count } = await prisma.syncLog.deleteMany({ where: { started_at: { lt: cutoff } } })
      return { deleted_count: count, cutoff_date: cutoff.toISOString(), retention_days: days }
    }

    case "PURGE_SOFT_DELETED_CATALOG": {
      const cutoff = new Date(Date.now() - 30 * 86_400_000)
      const items = await prisma.catalogItem.findMany({
        where: { deleted_at: { not: null, lt: cutoff } },
        select: { id: true },
      })
      let deleted = 0
      for (const item of items) {
        await prisma.channelAssignment.deleteMany({ where: { catalog_item_id: item.id } })
        await prisma.offerItem.deleteMany({ where: { catalog_item_id: item.id } })
        await prisma.catalogItem.delete({ where: { id: item.id } })
        deleted++
      }
      return { deleted_count: deleted, cutoff_date: cutoff.toISOString() }
    }

    case "PURGE_AUDIT_LOGS": {
      const config = await prisma.automationConfig.findFirst({ where: { config_key: "retention_days_audit" } })
      const days = parseInt(config?.config_value ?? "365", 10)
      const cutoff = new Date(Date.now() - days * 86_400_000)
      const { count } = await prisma.auditLog.deleteMany({ where: { created_at: { lt: cutoff } } })
      return { deleted_count: count, cutoff_date: cutoff.toISOString(), retention_days: days }
    }

    default:
      throw new Error(`Unknown job type: ${jobType}`)
  }
}
