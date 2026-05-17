"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, MoreHorizontal, Pencil, Trash2, RefreshCw, Wifi } from "lucide-react"
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
import { IntegrationForm } from "./integration-form"

type IntegrationRow = {
  id: string
  name: string
  slug: string
  integration_type: string
  base_url: string
  active: boolean
  sync_enabled: boolean
  last_sync_at: string | null
  default_channel_id: string | null
  default_channel: { id: string; name: string } | null
}

interface IntegrationsClientProps {
  integrations: IntegrationRow[]
  channels: { id: string; name: string }[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canExecute: boolean
}

export function IntegrationsClient({ integrations, channels, canCreate, canEdit, canDelete, canExecute }: IntegrationsClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<IntegrationRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IntegrationRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  async function handleTest(id: string) {
    setTestingId(id)
    try {
      const res = await fetch(`/api/integrations/${id}/test`, { method: "POST" })
      const data = await res.json()
      if (data.ok) {
        toast.success(`Conexão OK${data.store_name ? ` — ${data.store_name}` : ""}`)
      } else {
        toast.error(data.error ?? "Falha na conexão")
      }
    } finally {
      setTestingId(null)
    }
  }

  async function handleSync(id: string) {
    setSyncingId(id)
    try {
      const res = await fetch(`/api/integrations/${id}/sync`, { method: "POST" })
      const data = await res.json()
      if (data.status === "SUCCESS") {
        toast.success(`Sync concluído — ${data.created} criados, ${data.updated} atualizados`)
      } else if (data.status === "PARTIAL") {
        toast.warning(`Sync parcial — ${data.errors?.length ?? 0} erros`)
      } else {
        toast.error(data.errors?.[0] ?? "Sync falhou")
      }
      router.refresh()
    } finally {
      setSyncingId(null)
    }
  }

  async function handleCreate(data: Record<string, unknown>) {
    setLoading(true)
    try {
      const res = await fetch("/api/integrations", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao criar integração"); return }
      toast.success("Integração criada")
      setCreateOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!editTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/integrations/${editTarget.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao atualizar integração"); return }
      toast.success("Integração atualizada")
      setEditTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/integrations/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Erro ao excluir integração"); return }
      toast.success("Integração excluída")
      setDeleteTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  const columns: ColumnDef<IntegrationRow>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.base_url}</p>
        </div>
      ),
    },
    {
      accessorKey: "integration_type",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline">{row.original.integration_type}</Badge>,
    },
    {
      id: "channel",
      header: "Canal padrão",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.default_channel?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "sync",
      header: "Sync",
      cell: ({ row }) => (
        <Badge variant={row.original.sync_enabled ? "success" : "secondary"}>
          {row.original.sync_enabled ? "Habilitada" : "Desabilitada"}
        </Badge>
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
      id: "last_sync",
      header: "Último sync",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.last_sync_at
            ? new Date(row.original.last_sync_at).toLocaleString("pt-BR")
            : "Nunca"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const id = row.original.id
        const isSyncing = syncingId === id
        const isTesting = testingId === id
        if (!canEdit && !canDelete && !canExecute) return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canExecute && (
                <DropdownMenuItem disabled={isTesting} onClick={() => handleTest(id)}>
                  <Wifi className="mr-2 h-4 w-4" />
                  {isTesting ? "Testando..." : "Testar conexão"}
                </DropdownMenuItem>
              )}
              {canExecute && (
                <DropdownMenuItem disabled={isSyncing} onClick={() => handleSync(id)}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Sincronizando..." : "Sincronizar agora"}
                </DropdownMenuItem>
              )}
              {canExecute && (canEdit || canDelete) && <DropdownMenuSeparator />}
              {canEdit && <DropdownMenuItem onClick={() => setEditTarget(row.original)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>}
              {canEdit && canDelete && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(row.original)}>
                  <Trash2 className="mr-2 h-4 w-4" />Excluir
                </DropdownMenuItem>
              )}
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
        data={integrations}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            filterColumn="name"
            filterPlaceholder="Buscar integração..."
            actions={canCreate && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Nova integração
              </Button>
            )}
          />
        )}
      />
      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova integração" description="Configure uma nova conexão com sistema externo.">
        <IntegrationForm channels={channels} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={loading} />
      </FormDialog>
      <FormDialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }} title="Editar integração">
        {editTarget && (
          <IntegrationForm
            defaultValues={editTarget}
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
        title="Excluir integração"
        description={`Excluir "${deleteTarget?.name}"? As credenciais serão removidas permanentemente.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
