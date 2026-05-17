"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { DataTableToolbar } from "@/components/tables/data-table-toolbar"
import { FormDialog } from "@/components/dialogs/form-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { CatalogForm } from "./catalog-form"
import { getCatalogColumns } from "./catalog-columns"
import type { CreateCatalogItemInput } from "@/lib/validation/catalog"

type CatalogRow = {
  id: string
  title: string
  slug: string
  item_type: string
  source_type: string
  sku: string | null
  price: unknown
  active: boolean
  integration: { name: string } | null
}

interface CatalogClientProps {
  items: CatalogRow[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function CatalogClient({ items, canCreate, canEdit, canDelete }: CatalogClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CatalogRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CatalogRow | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: CreateCatalogItemInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao criar item"); return }
      toast.success("Item criado")
      setCreateOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleEdit(data: CreateCatalogItemInput) {
    if (!editTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/catalog/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao atualizar item"); return }
      toast.success("Item atualizado")
      setEditTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/catalog/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Erro ao excluir item"); return }
      toast.success("Item excluído")
      setDeleteTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  const columns = getCatalogColumns({ onEdit: setEditTarget, onDelete: setDeleteTarget, canEdit, canDelete })

  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            filterColumn="title"
            filterPlaceholder="Buscar item..."
            actions={canCreate && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Novo item
              </Button>
            )}
          />
        )}
      />
      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Novo item do catálogo">
        <CatalogForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={loading} />
      </FormDialog>
      <FormDialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }} title="Editar item">
        {editTarget && (
          <CatalogForm
            defaultValues={{ ...editTarget, id: editTarget.id } as Parameters<typeof CatalogForm>[0]["defaultValues"]}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={loading}
          />
        )}
      </FormDialog>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Excluir item"
        description={`Excluir "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
