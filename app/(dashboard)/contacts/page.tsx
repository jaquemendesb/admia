import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listContacts } from "@/lib/services/contacts.service"
import { PageHeader } from "@/components/layout/page-header"
import { ContactsClient } from "@/components/contacts/contacts-client"

export default async function ContactsPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const { contacts } = await listContacts({ pageSize: 100 })

  return (
    <div className="space-y-6">
      <PageHeader title="Contatos" description="Gerencie contatos e histórico de interações." />
      <ContactsClient
        contacts={contacts}
        canDelete={can(role, "contacts", "DELETE")}
      />
    </div>
  )
}
