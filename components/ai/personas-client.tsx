"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Persona } from "@prisma/client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { DataTableToolbar } from "@/components/tables/data-table-toolbar"
import { FormDialog } from "@/components/dialogs/form-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { PersonaForm } from "./persona-form"
import { getPersonaColumns } from "./persona-columns"
import type { CreatePersonaInput, UpdatePersonaInput } from "@/lib/validation/personas"

interface PersonasClientProps {
  personas: Persona[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function PersonasClient({ personas, canCreate, canEdit, canDelete }: PersonasClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Persona | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: CreatePersonaInput | UpdatePersonaInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao criar persona")
        return
      }
      toast.success("Persona criada com sucesso")
      setCreateOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(data: CreatePersonaInput | UpdatePersonaInput) {
    if (!editTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/personas/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao atualizar persona")
        return
      }
      toast.success("Persona atualizada")
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
      const res = await fetch(`/api/personas/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao excluir persona")
        return
      }
      toast.success("Persona excluída")
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const columns = getPersonaColumns({
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
    canEdit,
    canDelete,
  })

  return (
    <>
      <DataTable
        columns={columns}
        data={personas}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            filterColumn="name"
            filterPlaceholder="Buscar persona..."
            actions={
              canCreate && (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova persona
                </Button>
              )
            }
          />
        )}
      />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova persona">
        <PersonaForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} isSubmitting={loading} />
      </FormDialog>

      <FormDialog
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null) }}
        title="Editar persona"
      >
        {editTarget && (
          <PersonaForm
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
        title="Excluir persona"
        description={`Tem certeza que deseja excluir a persona "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
