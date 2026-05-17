"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Contact, ContactPolicy } from "@prisma/client"
import { DataTable } from "@/components/tables/data-table"
import { DataTableToolbar } from "@/components/tables/data-table-toolbar"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { getContactColumns } from "./contact-columns"

type ContactWithPolicies = Contact & { contact_policies: ContactPolicy[] }

interface ContactsClientProps {
  contacts: ContactWithPolicies[]
  canDelete: boolean
}

export function ContactsClient({ contacts, canDelete }: ContactsClientProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<ContactWithPolicies | null>(null)

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/contacts/${deleteTarget.id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Erro ao excluir contato")
      return
    }
    toast.success("Contato excluído")
    setDeleteTarget(null)
    router.refresh()
  }

  const columns = getContactColumns({ onDelete: setDeleteTarget, canDelete })

  return (
    <>
      <DataTable
        columns={columns}
        data={contacts}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            filterColumn="name"
            filterPlaceholder="Buscar contato..."
          />
        )}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Excluir contato"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name ?? deleteTarget?.phone ?? "este contato"}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
