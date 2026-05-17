import type { Metadata } from "next"
import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { PageHeader } from "@/components/layout/page-header"
import { SystemHealthClient } from "@/components/operations/system-health-client"
import { prisma } from "@/lib/db/client"

export const metadata: Metadata = { title: "Saúde do Sistema" }

export const dynamic = "force-dynamic"

async function fetchHealthData() {
  const checks: Record<string, { status: "ok" | "error"; detail?: string }> = {}

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: "ok" }
  } catch (err) {
    checks.database = { status: "error", detail: err instanceof Error ? err.message : "unreachable" }
  }

  let counts: Record<string, number> = {}
  if (checks.database.status === "ok") {
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
  }

  const healthy = Object.values(checks).every((c) => c.status === "ok")

  return {
    status: (healthy ? "ok" : "degraded") as "ok" | "degraded",
    uptime_seconds: 0,
    started_at: new Date().toISOString(),
    checks,
    counts,
  }
}

export default async function SystemHealthPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName

  if (!can(role, "system_health", "VIEW")) redirect("/dashboard")

  const healthData = await fetchHealthData()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saúde do Sistema"
        description="Visibilidade operacional do estado da plataforma ADMIA."
      />
      <SystemHealthClient initial={healthData} />
    </div>
  )
}
