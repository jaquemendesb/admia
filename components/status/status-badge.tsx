import { Badge } from "@/components/ui/badge"

type StatusVariant = "active" | "inactive" | "pending" | "error" | "success"

const statusConfig: Record<StatusVariant, { label: string; variant: "success" | "secondary" | "warning" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "success" },
  inactive: { label: "Inativo", variant: "secondary" },
  pending: { label: "Pendente", variant: "warning" },
  error: { label: "Erro", variant: "destructive" },
  success: { label: "Sucesso", variant: "success" },
}

interface StatusBadgeProps {
  status: StatusVariant | string
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status as StatusVariant]
  return (
    <Badge variant={config?.variant ?? "outline"}>
      {label ?? config?.label ?? status}
    </Badge>
  )
}
