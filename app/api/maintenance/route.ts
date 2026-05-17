import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { listMaintenanceJobs } from "@/lib/services/maintenance.service"

export async function GET(req: NextRequest) {
  return withPermission(req, "maintenance_jobs", "VIEW", async () => {
    return NextResponse.json(await listMaintenanceJobs())
  })
}
