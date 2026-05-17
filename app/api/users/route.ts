import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createUserSchema } from "@/lib/validation/users"
import { listUsers, createUser } from "@/lib/services/users.service"
import { createAuditLog, extractRequestMeta } from "@/lib/audit/logger"

export async function GET(req: NextRequest) {
  return withPermission(req, "users", "VIEW", async () => {
    return NextResponse.json(await listUsers())
  })
}

export async function POST(req: NextRequest) {
  return withPermission(req, "users", "CREATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const user = await createUser(parsed.data)
    const { ipAddress, userAgent } = extractRequestMeta(req)
    await createAuditLog({
      actorUserId: userId, resourceType: "user", resourceId: user.id,
      action: "CREATE", after: { email: user.email, role: parsed.data.role },
      ipAddress, userAgent,
    })
    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 })
  })
}
