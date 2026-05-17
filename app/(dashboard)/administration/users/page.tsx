import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listUsers } from "@/lib/services/users.service"
import { PageHeader } from "@/components/layout/page-header"
import { UsersClient } from "@/components/administration/users-client"

export default async function UsersPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName

  if (!can(role, "users", "VIEW")) {
    return <div className="text-muted-foreground p-8">Sem permissão. Esta seção é exclusiva para SUPER_ADMIN.</div>
  }

  const users = await listUsers()

  return (
    <div className="space-y-6">
      <PageHeader title="Usuários" description="Gerencie usuários e permissões de acesso ao ADMIA." />
      <UsersClient
        users={users.map((u) => ({
          ...u,
          last_login_at: u.last_login_at?.toISOString() ?? null,
          created_at: u.created_at.toISOString(),
        }))}
        currentUserId={session?.user?.id ?? ""}
      />
    </div>
  )
}
