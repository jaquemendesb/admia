import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listKnowledge } from "@/lib/services/knowledge.service"
import { listChannels } from "@/lib/services/channels.service"
import { PageHeader } from "@/components/layout/page-header"
import { KnowledgeClient } from "@/components/commerce/knowledge-client"

export default async function KnowledgePage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const [entries, channels] = await Promise.all([listKnowledge(), listChannels()])

  return (
    <div className="space-y-6">
      <PageHeader title="Base de Conhecimento" description="Documentos, FAQs e scripts usados pelos agentes de IA." />
      <KnowledgeClient
        entries={entries as Parameters<typeof KnowledgeClient>[0]["entries"]}
        channels={channels.map((c) => ({ id: c.id, name: c.name }))}
        canCreate={can(role, "knowledge", "CREATE")}
        canEdit={can(role, "knowledge", "UPDATE")}
        canDelete={can(role, "knowledge", "DELETE")}
      />
    </div>
  )
}
