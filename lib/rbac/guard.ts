import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { RoleName, Resource, Action } from "@/types/rbac"
import { can } from "./check"

type RouteHandler = (
  req: NextRequest,
  context: { userId: string; role: RoleName }
) => Promise<NextResponse>

export async function withAuth(
  req: NextRequest,
  handler: RouteHandler
): Promise<NextResponse> {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return handler(req, {
    userId: session.user.id,
    role: session.user.role as RoleName,
  })
}

export async function withPermission(
  req: NextRequest,
  resource: Resource,
  action: Action,
  handler: RouteHandler
): Promise<NextResponse> {
  return withAuth(req, async (req, context) => {
    if (!can(context.role, resource, action)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return handler(req, context)
  })
}
