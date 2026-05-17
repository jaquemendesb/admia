"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import type { Persona } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PersonaColumnsOptions {
  onEdit: (persona: Persona) => void
  onDelete: (persona: Persona) => void
  canEdit: boolean
  canDelete: boolean
}

export function getPersonaColumns({
  onEdit, onDelete, canEdit, canDelete,
}: PersonaColumnsOptions): ColumnDef<Persona>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.slug}</p>
          </div>
          {row.original.is_default && (
            <Badge variant="outline" className="text-xs border-brand-navy text-brand-navy shrink-0">Padrão</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "tone",
      header: "Tom",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.tone ?? "—"}</span>
      ),
    },
    {
      accessorKey: "language",
      header: "Idioma",
      cell: ({ row }) => <span className="text-sm">{row.original.language}</span>,
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
        const isDefault = row.original.is_default
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canEdit && canDelete && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={isDefault}
                  onClick={() => !isDefault && onDelete(row.original)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDefault ? "Padrão — não pode excluir" : "Excluir"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
