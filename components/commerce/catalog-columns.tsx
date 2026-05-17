"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"

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

interface CatalogColumnsOptions {
  onEdit: (item: CatalogRow) => void
  onDelete: (item: CatalogRow) => void
  canEdit: boolean
  canDelete: boolean
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  PRODUCT: "Produto", COURSE: "Curso", LESSON: "Aula", ARTICLE: "Artigo",
  DOWNLOAD: "Download", BONUS: "Bônus", MEMBERSHIP: "Membership", RESOURCE: "Recurso",
}

export function getCatalogColumns({ onEdit, onDelete, canEdit, canDelete }: CatalogColumnsOptions): ColumnDef<CatalogRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <div>
          <p className="font-medium line-clamp-1">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.sku ?? row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "item_type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">{ITEM_TYPE_LABELS[row.original.item_type] ?? row.original.item_type}</Badge>
      ),
    },
    {
      accessorKey: "source_type",
      header: "Origem",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.integration?.name ?? row.original.source_type}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Preço",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {formatCurrency(row.original.price as number | null)}
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
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" />Editar
                </DropdownMenuItem>
              )}
              {canEdit && canDelete && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(row.original)}>
                  <Trash2 className="mr-2 h-4 w-4" />Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
