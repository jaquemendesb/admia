import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listAuditLogs } from "@/lib/services/audit.service"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const ACTION_VARIANT: Record<string, "success" | "destructive" | "secondary" | "outline"> = {
  CREATE: "success",
  DELETE: "destructive",
  UPDATE: "outline",
  EXECUTE: "secondary",
}

export default async function AuditPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName

  if (!can(role, "audit_logs", "VIEW")) {
    return <div className="text-muted-foreground p-8">Sem permissão.</div>
  }

  const { logs, total } = await listAuditLogs({ pageSize: 100 })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description={`Rastreabilidade completa de ações. ${total.toLocaleString("pt-BR")} eventos registrados.`}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ator</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>ID do Recurso</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum evento registrado.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{log.actor?.name ?? "Sistema"}</p>
                    <p className="text-xs text-muted-foreground">{log.actor?.email ?? "—"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ACTION_VARIANT[log.action] ?? "secondary"}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">{log.resource_type}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px] block">
                    {log.resource_id ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{log.ip_address ?? "—"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {total > 100 && (
        <p className="text-xs text-muted-foreground text-center">
          Exibindo os 100 mais recentes de {total.toLocaleString("pt-BR")} eventos.
        </p>
      )}
    </div>
  )
}
