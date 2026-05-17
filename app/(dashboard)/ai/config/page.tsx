import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listConfigs } from "@/lib/services/automation-config.service"
import { PageHeader } from "@/components/layout/page-header"
import { AutomationConfigClient } from "@/components/ai/automation-config-client"

export default async function AiConfigPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const configs = await listConfigs()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuração de IA"
        description="Configure parâmetros globais de automação e comportamento dos agentes."
      />
      <AutomationConfigClient
        configs={configs}
        canCreate={can(role, "automation_config", "CREATE")}
        canEdit={can(role, "automation_config", "UPDATE")}
        canDelete={can(role, "automation_config", "DELETE")}
      />
    </div>
  )
}
