import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

const startedAt = new Date()

export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; detail?: string }> = {}

  // Database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: "ok" }
  } catch (err) {
    checks.database = { status: "error", detail: err instanceof Error ? err.message : "unreachable" }
  }

  // Counts (best-effort — skip on DB failure)
  let counts: Record<string, number> = {}
  if (checks.database.status === "ok") {
    try {
      const [users, integrations, contacts, syncLogs, maintenanceJobs] = await Promise.all([
        prisma.user.count({ where: { deleted_at: null, active: true } }),
        prisma.integration.count({ where: { deleted_at: null, active: true } }),
        prisma.contact.count({ where: { deleted_at: null } }),
        prisma.syncLog.count({ where: { status: "FAILED" } }),
        prisma.maintenanceJob.count({ where: { status: "RUNNING" } }),
      ])
      counts = {
        active_users: users,
        active_integrations: integrations,
        contacts,
        failed_sync_logs: syncLogs,
        running_jobs: maintenanceJobs,
      }
    } catch {
      // counts are optional
    }
  }

  const healthy = Object.values(checks).every((c) => c.status === "ok")
  const uptimeSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000)

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      uptime_seconds: uptimeSeconds,
      started_at: startedAt.toISOString(),
      checks,
      counts,
    },
    { status: healthy ? 200 : 503 }
  )
}
