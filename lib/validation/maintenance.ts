export const JOB_TYPES = [
  "SYNC_ALL_INTEGRATIONS",
  "PURGE_MESSAGES",
  "PURGE_SYNC_LOGS",
  "PURGE_SOFT_DELETED_CONTACTS",
  "PURGE_SOFT_DELETED_CATALOG",
  "PURGE_AUDIT_LOGS",
] as const

export type JobType = (typeof JOB_TYPES)[number]

export const ADMIN_SAFE_JOBS: JobType[] = ["SYNC_ALL_INTEGRATIONS"]

export const JOB_IS_DESTRUCTIVE: Record<JobType, boolean> = {
  SYNC_ALL_INTEGRATIONS: false,
  PURGE_MESSAGES: true,
  PURGE_SYNC_LOGS: true,
  PURGE_SOFT_DELETED_CONTACTS: true,
  PURGE_SOFT_DELETED_CATALOG: true,
  PURGE_AUDIT_LOGS: true,
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  SYNC_ALL_INTEGRATIONS: "Sincronizar todas as integrações",
  PURGE_MESSAGES: "Purge de mensagens antigas",
  PURGE_SYNC_LOGS: "Purge de logs de sincronização",
  PURGE_SOFT_DELETED_CONTACTS: "Purge de contatos excluídos",
  PURGE_SOFT_DELETED_CATALOG: "Purge de itens de catálogo excluídos",
  PURGE_AUDIT_LOGS: "Purge de audit logs antigos",
}

export const JOB_TYPE_DESCRIPTIONS: Record<JobType, string> = {
  SYNC_ALL_INTEGRATIONS: "Executa sync Woo para todas as integrações ativas com sync habilitado.",
  PURGE_MESSAGES: "Remove permanentemente mensagens mais antigas que retention_days_messages (padrão: 90 dias).",
  PURGE_SYNC_LOGS: "Remove permanentemente sync logs mais antigos que retention_days_sync_logs (padrão: 90 dias).",
  PURGE_SOFT_DELETED_CONTACTS: "Remove permanentemente contatos com deleted_at há mais de 30 dias, incluindo memória e políticas.",
  PURGE_SOFT_DELETED_CATALOG: "Remove permanentemente itens de catálogo com deleted_at há mais de 30 dias.",
  PURGE_AUDIT_LOGS: "Remove permanentemente audit logs mais antigos que retention_days_audit (padrão: 365 dias).",
}
