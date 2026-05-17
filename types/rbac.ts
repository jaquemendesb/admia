export enum RoleName {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  READONLY = "READONLY",
}

export type Resource =
  | "dashboard"
  | "business_channels"
  | "integrations"
  | "catalog"
  | "offers"
  | "knowledge"
  | "personas"
  | "agents"
  | "routing_rules"
  | "prompt_templates"
  | "automation_config"
  | "contacts"
  | "test_contacts"
  | "whitelist"
  | "blacklist"
  | "contact_memory"
  | "contact_policies"
  | "policy_logs"
  | "sync_logs"
  | "maintenance_jobs"
  | "system_health"
  | "audit_logs"
  | "users"
  | "roles"
  | "security_settings"

export type Action = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "EXECUTE"
