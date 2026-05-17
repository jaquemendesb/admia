import { auth } from "@/lib/auth/config"
import { RoleName } from "@/types/rbac"
import { can } from "@/lib/rbac/check"
import type { Resource, Action } from "@/types/rbac"

export async function getSession() {
  return auth()
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requirePermission(resource: Resource, action: Action) {
  const session = await requireAuth()
  const role = session.user.role as RoleName
  if (!can(role, resource, action)) {
    throw new Error(`Forbidden: ${role} cannot ${action} ${resource}`)
  }
  return session
}
