"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Contact, ContactPolicy } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { POLICY_TYPE_LABELS } from "@/lib/validation/contacts"

type ContactWithPolicies = Contact & { contact_policies: ContactPolicy[] }

interface ContactColumnsOptions {
  onDelete: (contact: ContactWithPolicies) => void
  canDelete: boolean
}

function ActionsCell({
  contact,
  onDelete,
  canDelete,
}: {
  contact: ContactWithPolicies
  onDelete: (c: ContactWithPolicies) => void
  canDelete: boolean
}) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/contacts/${contact.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalhes
        </DropdownMenuItem>
        {canDelete && <DropdownMenuSeparator />}
        {canDelete && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(contact)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function getContactColumns({
  onDelete, canDelete,
}: ContactColumnsOptions): ColumnDef<ContactWithPolicies>[] {
  return [
    {
      accessorKey: "name",
      header: "Contato",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{row.original.phone ?? row.original.email ?? ""}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.phone ?? "—"}</span>
      ),
    },
    {
      id: "policies",
      header: "Políticas ativas",
      cell: ({ row }) => {
        const active = row.original.contact_policies.filter((p) => p.active)
        if (!active.length) return <span className="text-muted-foreground text-xs">Nenhuma</span>
        return (
          <div className="flex gap-1 flex-wrap">
            {active.map((p) => (
              <Badge
                key={p.id}
                variant={p.policy_type === "BLACKLIST" ? "destructive" : p.policy_type === "WHITELIST" ? "success" : "secondary"}
                className="text-xs"
              >
                {POLICY_TYPE_LABELS[p.policy_type as keyof typeof POLICY_TYPE_LABELS]}
              </Badge>
            ))}
          </div>
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
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ActionsCell contact={row.original} onDelete={onDelete} canDelete={canDelete} />
      ),
    },
  ]
}
