import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listAgents } from "@/lib/services/agents.service"
import { PageHeader } from "@/components/layout/page-header"
import { AgentsClient } from "@/components/ai/agents-client"

export default async function AgentsPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const agents = await listAgents()

  return (
    <div className="space-y-6">
      <PageHeader title="Agentes" description="Gerencie os agentes de IA e suas configurações." />
      <AgentsClient
        agents={agents}
        canCreate={can(role, "agents", "CREATE")}
        canEdit={can(role, "agents", "UPDATE")}
        canDelete={can(role, "agents", "DELETE")}
      />
    </div>
  )
}
