export const STATUS_LABELS = {
  active: "Ativo",
  inactive: "Inativo",
  pending: "Pendente",
  success: "Sucesso",
  warning: "Atenção",
  error: "Erro",
  syncing: "Sincronizando",
  disabled: "Desabilitado",
} as const

export type StatusKey = keyof typeof STATUS_LABELS

export const STATUS_VARIANTS: Record<StatusKey, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
  success: "default",
  warning: "outline",
  error: "destructive",
  syncing: "secondary",
  disabled: "secondary",
}
