import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { z } from "zod"
import {
  executeMaintenanceJob,
  JOB_TYPES,
  ADMIN_SAFE_JOBS,
  JOB_IS_DESTRUCTIVE,
  type JobType,
} from "@/lib/services/maintenance.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"
import { RoleName } from "@/types/rbac"

const schema = z.object({
  job_type: z.enum(JOB_TYPES),
})

export async function POST(req: NextRequest) {
  return withPermission(req, "maintenance_jobs", "EXECUTE", async (req, { userId, role }) => {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }

    const jobType = parsed.data.job_type as JobType

    // ADMIN can only execute non-destructive jobs
    if (role !== RoleName.SUPER_ADMIN && !ADMIN_SAFE_JOBS.includes(jobType)) {
      return NextResponse.json({ error: "Apenas SUPER_ADMIN pode executar jobs destrutivos" }, { status: 403 })
    }

    const jobId = await executeMaintenanceJob(jobType, userId)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId,
      resourceType: "maintenance_job",
      resourceId: jobId,
      action: "EXECUTE",
      after: { job_type: jobType, destructive: JOB_IS_DESTRUCTIVE[jobType] },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ job_id: jobId })
  })
}
