import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { runWooSync } from "@/lib/services/woo-sync.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "integrations", "EXECUTE", async (req, { userId }) => {
    const result = await runWooSync(id)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "integration_sync", resourceId: id,
      action: "EXECUTE",
      after: {
        sync_log_id: result.syncLogId,
        status: result.status,
        created: result.created,
        updated: result.updated,
        deactivated: result.deactivated,
      },
      ipAddress, userAgent,
    })
    return NextResponse.json(result)
  })
}
