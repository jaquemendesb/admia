import { auth } from "@/lib/auth/config"
import { can, isSuperAdmin } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listMaintenanceJobs } from "@/lib/services/maintenance.service"
import { PageHeader } from "@/components/layout/page-header"
import { MaintenanceClient } from "@/components/operations/maintenance-client"

export default async function MaintenancePage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const jobs = await listMaintenanceJobs()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs de Manutenção"
        description="Monitore e execute operações de manutenção do sistema."
      />
      <MaintenanceClient
        jobs={jobs.map((j) => ({
          ...j,
          started_at: j.started_at?.toISOString() ?? null,
          finished_at: j.finished_at?.toISOString() ?? null,
          created_at: j.created_at.toISOString(),
        }))}
        canExecute={can(role, "maintenance_jobs", "EXECUTE")}
        isSuperAdmin={isSuperAdmin(role)}
      />
    </div>
  )
}
