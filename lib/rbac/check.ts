import { RoleName, Resource, Action } from "@/types/rbac"
import { ROLE_PERMISSIONS } from "./roles"

export function can(role: RoleName, resource: Resource, action: Action): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions[resource]?.includes(action) ?? false
}

export function canOrThrow(
  role: RoleName,
  resource: Resource,
  action: Action
): void {
  if (!can(role, resource, action)) {
    throw new Error(`Forbidden: role ${role} cannot ${action} ${resource}`)
  }
}

export function isSuperAdmin(role: string): boolean {
  return role === RoleName.SUPER_ADMIN
}
