"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { AiAgent } from "@prisma/client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { DataTableToolbar } from "@/components/tables/data-table-toolbar"
import { FormDialog } from "@/components/dialogs/form-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { AgentForm } from "./agent-form"
import { getAgentColumns } from "./agent-columns"
import type { CreateAgentInput, UpdateAgentInput } from "@/lib/validation/agents"

interface AgentsClientProps {
  agents: AiAgent[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function AgentsClient({ agents, canCreate, canEdit, canDelete }: AgentsClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AiAgent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AiAgent | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: CreateAgentInput | UpdateAgentInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao criar agente")
        return
      }
      toast.success("Agente criado com sucesso")
      setCreateOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(data: CreateAgentInput | UpdateAgentInput) {
    if (!editTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/agents/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao atualizar agente")
        return
      }
      toast.success("Agente atualizado")
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
      const res = await fetch(`/api/agents/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Erro ao excluir agente")
        return
      }
      toast.success("Agente excluído")
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const columns = getAgentColumns({
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
    canEdit,
    canDelete,
  })

  return (
    <>
      <DataTable
        columns={columns}
        data={agents}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            filterColumn="name"
            filterPlaceholder="Buscar agente..."
            actions={
              canCreate && (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo agente
                </Button>
              )
            }
          />
        )}
      />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Novo agente">
        <AgentForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} isSubmitting={loading} />
      </FormDialog>

      <FormDialog
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null) }}
        title="Editar agente"
      >
        {editTarget && (
          <AgentForm
            defaultValues={editTarget}
            isEditing
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            isSubmitting={loading}
          />
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Excluir agente"
        description={`Tem certeza que deseja excluir o agente "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
