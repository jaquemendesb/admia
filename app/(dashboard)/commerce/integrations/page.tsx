import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listIntegrations } from "@/lib/services/integrations.service"
import { listChannels } from "@/lib/services/channels.service"
import { PageHeader } from "@/components/layout/page-header"
import { IntegrationsClient } from "@/components/commerce/integrations-client"

export default async function IntegrationsPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const [rawIntegrations, channels] = await Promise.all([listIntegrations(), listChannels()])

  const integrations = rawIntegrations.map(({ credentials_encrypted: _, metadata, ...rest }) => ({
    ...rest,
    webhook_secret: (metadata as Record<string, unknown> | null)?.webhook_secret as string | null ?? null,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrações"
        description="Conexões com sistemas externos. Credenciais armazenadas com criptografia AES-256-GCM."
      />
      <IntegrationsClient
        integrations={integrations as Parameters<typeof IntegrationsClient>[0]["integrations"]}
        channels={channels.map((c) => ({ id: c.id, name: c.name }))}
        canCreate={can(role, "integrations", "CREATE")}
        canEdit={can(role, "integrations", "UPDATE")}
        canDelete={can(role, "integrations", "DELETE")}
        canExecute={can(role, "integrations", "EXECUTE")}
      />
    </div>
  )
}
