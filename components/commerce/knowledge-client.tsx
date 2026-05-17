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
import { KnowledgeForm } from "./knowledge-form"
import { KNOWLEDGE_TYPE_LABELS } from "@/lib/validation/knowledge"
import type { CreateKnowledgeInput } from "@/lib/validation/knowledge"

type KnowledgeRow = {
  id: string
  title: string
  slug: string
  knowledge_type: string
  active: boolean
  business_channel: { id: string; name: string } | null
  content: string
  business_channel_id: string | null
}

interface KnowledgeClientProps {
  entries: KnowledgeRow[]
  channels: { id: string; name: string }[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function KnowledgeClient({ entries, channels, canCreate, canEdit, canDelete }: KnowledgeClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<KnowledgeRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeRow | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: CreateKnowledgeInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao criar entrada"); return }
      toast.success("Entrada criada")
      setCreateOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleEdit(data: CreateKnowledgeInput) {
    if (!editTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/knowledge/${editTarget.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao atualizar entrada"); return }
      toast.success("Entrada atualizada")
      setEditTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/knowledge/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Erro ao excluir entrada"); return }
      toast.success("Entrada excluída")
      setDeleteTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  const columns: ColumnDef<KnowledgeRow>[] = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <div>
          <p className="font-medium line-clamp-1">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "knowledge_type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">
          {KNOWLEDGE_TYPE_LABELS[row.original.knowledge_type as keyof typeof KNOWLEDGE_TYPE_LABELS] ?? row.original.knowledge_type}
        </Badge>
      ),
    },
    {
      id: "channel",
      header: "Canal",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.business_channel?.name ?? "Todos"}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "success" : "secondary"}>
          {row.original.active ? "Ativo" : "Inativo"}
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
        data={entries}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            filterColumn="title"
            filterPlaceholder="Buscar entrada..."
            actions={canCreate && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Nova entrada
              </Button>
            )}
          />
        )}
      />
      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova entrada de conhecimento">
        <KnowledgeForm channels={channels} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={loading} />
      </FormDialog>
      <FormDialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }} title="Editar entrada">
        {editTarget && (
          <KnowledgeForm
            defaultValues={{ ...editTarget, id: editTarget.id, knowledge_type: editTarget.knowledge_type as CreateKnowledgeInput["knowledge_type"] }}
            channels={channels}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={loading}
          />
        )}
      </FormDialog>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Excluir entrada"
        description={`Excluir "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
