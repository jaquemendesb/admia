import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listChannels } from "@/lib/services/channels.service"
import { PageHeader } from "@/components/layout/page-header"
import { ChannelsClient } from "@/components/commerce/channels-client"

export default async function ChannelsPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const channels = await listChannels()

  return (
    <div className="space-y-6">
      <PageHeader title="Canais" description="Gerencie os canais comerciais do negócio." />
      <ChannelsClient
        channels={channels}
        canCreate={can(role, "business_channels", "CREATE")}
        canEdit={can(role, "business_channels", "UPDATE")}
        canDelete={can(role, "business_channels", "DELETE")}
      />
    </div>
  )
}
