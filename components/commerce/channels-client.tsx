"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { BusinessChannel } from "@prisma/client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { DataTableToolbar } from "@/components/tables/data-table-toolbar"
import { FormDialog } from "@/components/dialogs/form-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { ChannelForm } from "./channel-form"
import { getChannelColumns } from "./channel-columns"
import type { CreateChannelInput } from "@/lib/validation/channels"

interface ChannelsClientProps {
  channels: BusinessChannel[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function ChannelsClient({ channels, canCreate, canEdit, canDelete }: ChannelsClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BusinessChannel | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BusinessChannel | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: CreateChannelInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao criar canal")
        return
      }
      toast.success("Canal criado com sucesso")
      setCreateOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(data: CreateChannelInput) {
    if (!editTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/channels/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao atualizar canal")
        return
      }
      toast.success("Canal atualizado")
      setEditTarget(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/channels/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Erro ao excluir canal")
        return
      }
      toast.success("Canal excluído")
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const columns = getChannelColumns({
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
    canEdit,
    canDelete,
  })

  return (
    <>
      <DataTable
        columns={columns}
        data={channels}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            filterColumn="name"
            filterPlaceholder="Buscar canal..."
            actions={
              canCreate && (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo canal
                </Button>
              )
            }
          />
        )}
      />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Novo canal">
        <ChannelForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={loading} />
      </FormDialog>

      <FormDialog
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null) }}
        title="Editar canal"
      >
        {editTarget && (
          <ChannelForm
            defaultValues={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={loading}
          />
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Excluir canal"
        description={`Tem certeza que deseja excluir o canal "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
