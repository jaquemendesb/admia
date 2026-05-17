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
import { UserForm } from "./user-form"
import { ROLE_LABELS } from "@/lib/validation/users"
import type { CreateUserInput, UpdateUserInput } from "@/lib/validation/users"

type UserRow = {
  id: string
  name: string | null
  email: string
  active: boolean
  last_login_at: string | null
  created_at: string
  user_roles: { role: { name: string } }[]
}

interface UsersClientProps {
  users: UserRow[]
  currentUserId: string
}

export function UsersClient({ users, currentUserId }: UsersClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UserRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: CreateUserInput | UpdateUserInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao criar usuário"); return }
      toast.success("Usuário criado")
      setCreateOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleEdit(data: CreateUserInput | UpdateUserInput) {
    if (!editTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${editTarget.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao atualizar usuário"); return }
      toast.success("Usuário atualizado")
      setEditTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao excluir usuário"); return }
      toast.success("Usuário excluído")
      setDeleteTarget(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "name",
      header: "Usuário",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: "role",
      header: "Perfil",
      cell: ({ row }) => {
        const roleName = row.original.user_roles[0]?.role.name
        return (
          <Badge variant="outline">
            {roleName ? (ROLE_LABELS[roleName as keyof typeof ROLE_LABELS] ?? roleName) : "—"}
          </Badge>
        )
      },
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
      id: "last_login",
      header: "Último acesso",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.last_login_at
            ? new Date(row.original.last_login_at).toLocaleString("pt-BR")
            : "Nunca"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const isSelf = row.original.id === currentUserId
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditTarget(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />Editar
              </DropdownMenuItem>
              {!isSelf && <DropdownMenuSeparator />}
              {!isSelf && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteTarget(row.original)}
                >
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
        data={users}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            filterColumn="name"
            filterPlaceholder="Buscar usuário..."
            actions={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Novo usuário
              </Button>
            }
          />
        )}
      />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Novo usuário">
        <UserForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} isSubmitting={loading} />
      </FormDialog>

      <FormDialog
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null) }}
        title="Editar usuário"
      >
        {editTarget && (
          <UserForm
            defaultValues={{
              name: editTarget.name ?? "",
              email: editTarget.email,
              role: (editTarget.user_roles[0]?.role.name as never) ?? undefined,
              active: editTarget.active,
            }}
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
        title="Excluir usuário"
        description={`Excluir "${deleteTarget?.name ?? deleteTarget?.email}"? O usuário perderá acesso imediatamente.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
