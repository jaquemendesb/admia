import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { listAuditLogs } from "@/lib/services/audit.service"

export async function GET(req: NextRequest) {
  return withPermission(req, "audit_logs", "VIEW", async () => {
    const { searchParams } = new URL(req.url)
    return NextResponse.json(await listAuditLogs({
      resource_type: searchParams.get("resource_type") ?? undefined,
      action: searchParams.get("action") ?? undefined,
      actor_email: searchParams.get("actor_email") ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      pageSize: Number(searchParams.get("pageSize") ?? "50"),
    }))
  })
}
