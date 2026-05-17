"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/tables/data-table"
import { DataTableToolbar } from "@/components/tables/data-table-toolbar"
import { FormDialog } from "@/components/dialogs/form-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { OfferForm } from "./offer-form"
import type { CreateOfferInput } from "@/lib/validation/offers"
import { formatCurrency } from "@/lib/utils"

type OfferRow = {
  id: string
  title: string
  slug: string
  description: string | null
  active: boolean
  base_price: unknown
  sale_price: unknown
  offer_items: { id: string; catalog_item: { title: string } }[]
}

interface OffersClientProps {
  offers: OfferRow[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function OffersClient({ offers, canCreate, canEdit, canDelete }: OffersClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<OfferRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OfferRow | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: CreateOfferInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/offers", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao criar oferta"); return }
      toast.success("Oferta criada")
      setCreateOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleEdit(data: CreateOfferInput) {
    if (!editTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/offers/${editTarget.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao atualizar oferta"); return }
      toast.success("Oferta atualizada")
      setEditTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/offers/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Erro ao excluir oferta"); return }
      toast.success("Oferta excluída")
      setDeleteTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  const columns: ColumnDef<OfferRow>[] = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
    },
    {
      id: "items",
      header: "Itens",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.offer_items.length} item(s)</span>
      ),
    },
    {
      accessorKey: "base_price",
      header: "Preço",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">{formatCurrency(row.original.base_price as number | null)}</span>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "success" : "secondary"}>
          {row.original.active ? "Ativa" : "Inativa"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (!canEdit && !canDelete) return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && <DropdownMenuItem onClick={() => setEditTarget(row.original)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>}
              {canEdit && canDelete && <DropdownMenuSeparator />}
              {canDelete && <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={offers}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            filterColumn="title"
            filterPlaceholder="Buscar oferta..."
            actions={canCreate && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Nova oferta
              </Button>
            )}
          />
        )}
      />
      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova oferta">
        <OfferForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={loading} />
      </FormDialog>
      <FormDialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }} title="Editar oferta">
        {editTarget && (
          <OfferForm
            defaultValues={{ ...editTarget, id: editTarget.id, base_price: editTarget.base_price as number | null | undefined, sale_price: editTarget.sale_price as number | null | undefined }}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={loading}
          />
        )}
      </FormDialog>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Excluir oferta"
        description={`Excluir "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
