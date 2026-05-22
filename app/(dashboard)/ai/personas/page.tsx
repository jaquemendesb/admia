import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listPersonas } from "@/lib/services/personas.service"
import { PageHeader } from "@/components/layout/page-header"
import { PersonasClient } from "@/components/ai/personas-client"
import { CacheStatusBadge } from "@/components/ai/cache-status-badge"

export default async function PersonasPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const personas = await listPersonas()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personas"
        description="Configure as personas dos agentes de IA."
        actions={<CacheStatusBadge />}
      />
      <PersonasClient
        personas={personas}
        canCreate={can(role, "personas", "CREATE")}
        canEdit={can(role, "personas", "UPDATE")}
        canDelete={can(role, "personas", "DELETE")}
      />
    </div>
  )
}
