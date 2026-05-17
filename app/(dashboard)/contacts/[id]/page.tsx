import { notFound } from "next/navigation"
import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { getContact, listPolicyLogs } from "@/lib/services/contacts.service"
import { PageHeader } from "@/components/layout/page-header"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Badge } from "@/components/ui/badge"
import { ContactDetailClient } from "@/components/contacts/contact-detail-client"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName

  const [contact, policyLogs] = await Promise.all([
    getContact(id),
    listPolicyLogs(id),
  ])

  if (!contact) notFound()

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Contatos", href: "/contacts" },
        { label: contact.name ?? contact.phone ?? "Contato" },
      ]} />
      <PageHeader
        title={contact.name ?? contact.phone ?? "Contato sem nome"}
        description={[contact.phone, contact.email].filter(Boolean).join(" · ")}
        actions={
          <Badge variant={contact.active ? "success" : "secondary"}>
            {contact.active ? "Ativo" : "Inativo"}
          </Badge>
        }
      />
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs mb-1">Conversas</p>
          <p className="text-2xl font-semibold">{contact._count.conversations}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs mb-1">Mensagens</p>
          <p className="text-2xl font-semibold">{contact._count.messages}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs mb-1">Memórias</p>
          <p className="text-2xl font-semibold">{contact.contact_memory.length}</p>
        </div>
      </div>
      <ContactDetailClient
        contact={contact}
        policyLogs={policyLogs}
        canEditMemory={can(role, "contact_memory", "UPDATE")}
        canDeleteMemory={can(role, "contact_memory", "DELETE")}
        canCreatePolicy={can(role, "contact_policies", "CREATE")}
        canEditPolicy={can(role, "contact_policies", "UPDATE")}
        canDeletePolicy={can(role, "contact_policies", "DELETE")}
      />
    </div>
  )
}
